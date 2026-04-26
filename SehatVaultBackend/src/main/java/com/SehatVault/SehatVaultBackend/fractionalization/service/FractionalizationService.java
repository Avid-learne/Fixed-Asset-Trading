package com.SehatVault.SehatVaultBackend.fractionalization.service;

import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.AdminDecisionRequest;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.CreateFractionalizationRequest;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.FractionalAllocationView;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.FractionalizationRequestView;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.RedeemFractionalHtRequest;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.RevokeAllocationRequest;
import com.SehatVault.SehatVaultBackend.fractionalization.entity.FractionalHtAllocation;
import com.SehatVault.SehatVaultBackend.fractionalization.entity.FractionalizationBeneficiary;
import com.SehatVault.SehatVaultBackend.fractionalization.entity.FractionalizationRequest;
import com.SehatVault.SehatVaultBackend.fractionalization.repository.FractionalHtAllocationRepository;
import com.SehatVault.SehatVaultBackend.fractionalization.repository.FractionalizationBeneficiaryRepository;
import com.SehatVault.SehatVaultBackend.fractionalization.repository.FractionalizationRequestRepository;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.notification.service.NotificationService;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FractionalizationService {

    private final FractionalizationRequestRepository requestRepository;
    private final FractionalizationBeneficiaryRepository beneficiaryRepository;
    private final FractionalHtAllocationRepository allocationRepository;

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;

    private final CardRepository cardRepository;
    private final HealthCardRepository healthCardRepository;

    private final WalletTransactionRepository walletTransactionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;

    @Transactional
    public FractionalizationRequestView submitRequest(String patientEmail, CreateFractionalizationRequest req) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == null || user.getRole().getRoleName() != Role.RoleType.patient) {
            throw new IllegalArgumentException("Only patients can submit fractionalization requests");
        }

        Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        validatePrimaryPatientEligibility(user, patient);

        String source = normalizeSource(req.getSource());
        BigDecimal fractionalizeAmount = nz(req.getFractionalizeHtAmount());
        if (fractionalizeAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Fractionalize HT amount must be greater than zero");
        }

        ensurePrimaryHasSufficientSourceHt(patient, fractionalizeAmount, source);

        if (req.getBeneficiaries() == null || req.getBeneficiaries().isEmpty()) {
            throw new IllegalArgumentException("At least one beneficiary is required");
        }

        Set<UUID> seen = new HashSet<>();
        BigDecimal totalPercent = BigDecimal.ZERO;

        FractionalizationRequest request = new FractionalizationRequest();
        request.setPrimaryPatientId(patient.getId());
        request.setPrimaryPatientUserId(patient.getUserId());
        request.setHospitalId(patient.getHospitalId());
        request.setSource(source);
        request.setFractionalizeHtAmount(fractionalizeAmount);
        request.setStatus(FractionalizationRequest.Status.PENDING_ADMIN);
        request.setPatientNote(req.getPatientNote());

        FractionalizationRequest savedRequest = requestRepository.save(request);

        for (CreateFractionalizationRequest.BeneficiaryShare b : req.getBeneficiaries()) {
            if (b.getBeneficiaryUserId() == null) {
                throw new IllegalArgumentException("Beneficiary user ID is required");
            }
            if (!seen.add(b.getBeneficiaryUserId())) {
                throw new IllegalArgumentException("Duplicate beneficiary is not allowed");
            }
            if (b.getBeneficiaryUserId().equals(patient.getUserId())) {
                throw new IllegalArgumentException("Primary patient cannot be listed as beneficiary");
            }

            User beneficiaryUser = userRepository.findById(b.getBeneficiaryUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Beneficiary user not found: " + b.getBeneficiaryUserId()));

            if (beneficiaryUser.getRole() == null || beneficiaryUser.getRole().getRoleName() != Role.RoleType.patient) {
                throw new IllegalArgumentException("Beneficiary must be a patient user");
            }

            Patient beneficiaryPatient = patientRepository.findByUserId(beneficiaryUser.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Beneficiary patient profile not found"));

            if (beneficiaryPatient.getHospitalId() == null || !beneficiaryPatient.getHospitalId().equals(patient.getHospitalId())) {
                throw new IllegalArgumentException("Beneficiaries must belong to the same hospital");
            }

            BigDecimal pct = nz(b.getFractionPercent());
            if (pct.compareTo(BigDecimal.ZERO) <= 0 || pct.compareTo(new BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Beneficiary fraction percent must be between 0 and 100");
            }

            totalPercent = totalPercent.add(pct);

            BigDecimal allocated = fractionalizeAmount
                    .multiply(pct)
                    .divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);

            FractionalizationBeneficiary row = new FractionalizationBeneficiary();
            row.setRequestId(savedRequest.getRequestId());
            row.setBeneficiaryPatientId(beneficiaryPatient.getId());
            row.setBeneficiaryUserId(beneficiaryUser.getUserId());
            row.setFractionPercent(pct);
            row.setAllocatedHt(allocated);
            beneficiaryRepository.save(row);
        }

        if (totalPercent.compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Total beneficiary fractions cannot exceed 100%");
        }

        notifyHospitalAdmins(patient.getHospitalId(), patient.getUserId(),
                "Fractionalization Request",
                "A patient submitted HT fractionalization request awaiting NOC approval.");

        return mapRequestView(savedRequest);
    }

    public List<FractionalizationRequestView> listMyRequests(String patientEmail) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        return requestRepository.findByPrimaryPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream()
                .map(this::mapRequestView)
                .toList();
    }

    public List<FractionalizationRequestView> listPendingForAdmin(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));

        requireHospitalAdmin(admin);

        return requestRepository
                .findByHospitalIdAndStatusOrderByCreatedAtAsc(admin.getHospitalId(), FractionalizationRequest.Status.PENDING_ADMIN)
                .stream()
                .map(this::mapRequestView)
                .toList();
    }

    public List<FractionalizationRequestView> listPendingForInsurer(String insurerEmail) {
        User insurer = userRepository.findByEmail(insurerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Insurer user not found"));

        requireInsurer(insurer);

        return requestRepository.findAll().stream()
            .filter(r -> r.getStatus() == FractionalizationRequest.Status.PENDING_INSURER)
                .map(this::mapRequestView)
                .toList();
    }

    @Transactional
    public FractionalizationRequestView forwardToInsurer(String adminEmail, UUID requestId) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
        requireHospitalAdmin(admin);

        FractionalizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!admin.getHospitalId().equals(request.getHospitalId())) {
            throw new IllegalArgumentException("Cannot forward request from another hospital");
        }
        if (request.getStatus() != FractionalizationRequest.Status.PENDING_ADMIN) {
            throw new IllegalArgumentException("Only pending requests can be forwarded");
        }

        request.setStatus(FractionalizationRequest.Status.PENDING_INSURER);
        request.setReviewedBy(admin.getUserId());
        request.setReviewedAt(LocalDateTime.now());

        FractionalizationRequest saved = requestRepository.save(request);

        Set<UUID> insurerUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().getRoleName() == Role.RoleType.insurance_company)
                .map(User::getUserId)
                .collect(java.util.stream.Collectors.toSet());
        notificationService.notifyUsers(
                admin.getUserId(),
                insurerUsers,
                "Fractionalization Forwarded",
                "A request was forwarded by hospital admin for insurer NOC verification."
        );

        return mapRequestView(saved);
    }

    @Transactional
    public FractionalizationRequestView approveWithNoc(String adminEmail, UUID requestId, AdminDecisionRequest req) {
        User insurer = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Insurer user not found"));
        requireInsurer(insurer);

        FractionalizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getStatus() != FractionalizationRequest.Status.PENDING_INSURER) {
            throw new IllegalArgumentException("Only insurer-pending requests can be approved");
        }

        if (req.getNocNumber() == null || req.getNocNumber().isBlank()) {
            throw new IllegalArgumentException("NOC number is required");
        }
        if (req.getInsurerName() == null || req.getInsurerName().isBlank()) {
            throw new IllegalArgumentException("Insurer name is required");
        }
        if (req.getNocIssuedAt() == null || req.getNocExpiresAt() == null) {
            throw new IllegalArgumentException("NOC issue and expiry dates are required");
        }
        if (!req.getNocExpiresAt().isAfter(req.getNocIssuedAt())) {
            throw new IllegalArgumentException("NOC expiry must be after issue date");
        }

        Patient primary = patientRepository.findById(request.getPrimaryPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Primary patient not found"));

        User primaryUser = userRepository.findById(primary.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Primary user not found"));

        validatePrimaryPatientEligibility(primaryUser, primary);

        ensurePrimaryHasSufficientSourceHt(primary, request.getFractionalizeHtAmount(), request.getSource());

        // Reserve/deduct from primary immediately at activation.
        deductPrimarySourceHt(primary, request.getFractionalizeHtAmount(), request.getSource());

        List<FractionalizationBeneficiary> beneficiaries = beneficiaryRepository.findByRequestId(request.getRequestId());
        if (beneficiaries.isEmpty()) {
            throw new IllegalArgumentException("Request has no beneficiaries");
        }

        for (FractionalizationBeneficiary b : beneficiaries) {
            FractionalHtAllocation a = new FractionalHtAllocation();
            a.setRequestId(request.getRequestId());
            a.setPrimaryPatientId(request.getPrimaryPatientId());
            a.setPrimaryUserId(request.getPrimaryPatientUserId());
            a.setBeneficiaryPatientId(b.getBeneficiaryPatientId());
            a.setBeneficiaryUserId(b.getBeneficiaryUserId());
            a.setHospitalId(request.getHospitalId());
            a.setSource(request.getSource());
            a.setTotalAllocatedHt(nz(b.getAllocatedHt()));
            a.setRemainingHt(nz(b.getAllocatedHt()));
            a.setStatus(FractionalHtAllocation.Status.ACTIVE);
            a.setNocNumber(req.getNocNumber().trim());
            a.setInsurerName(req.getInsurerName().trim());
            a.setNocIssuedAt(req.getNocIssuedAt());
            a.setNocExpiresAt(req.getNocExpiresAt());
            a.setNocDocument(req.getNocDocument());
            allocationRepository.save(a);

            notificationService.notifyUser(
                    insurer.getUserId(),
                    b.getBeneficiaryUserId(),
                    "Fractional HT Allocated",
                    "You received a fractional HT allocation under NOC " + req.getNocNumber().trim()
            );
        }

        request.setStatus(FractionalizationRequest.Status.ACTIVE);
        request.setNocNumber(req.getNocNumber().trim());
        request.setInsurerName(req.getInsurerName().trim());
        request.setNocIssuedAt(req.getNocIssuedAt());
        request.setNocExpiresAt(req.getNocExpiresAt());
        request.setNocDocument(req.getNocDocument());
        request.setReviewedBy(insurer.getUserId());
        request.setReviewedAt(LocalDateTime.now());
        request.setRejectionReason(null);

        FractionalizationRequest saved = requestRepository.save(request);

        notificationService.notifyUser(
                insurer.getUserId(),
                primary.getUserId(),
                "Fractionalization Approved",
                "Your HT fractionalization is active under NOC " + request.getNocNumber()
        );

        ActivityLog activity = new ActivityLog();
        activity.setUserId(primary.getUserId());
        activity.setActivityName("HT Fractionalization Activated");
        activity.setDescription("Fractionalization approved with NOC " + request.getNocNumber());
        activity.setType(ActivityLog.ActivityType.ACTION);
        activity.setStatus("SUCCESS");
        activity.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(activity);

        return mapRequestView(saved);
    }

    @Transactional
    public FractionalizationRequestView reject(String adminEmail, UUID requestId, AdminDecisionRequest req) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FractionalizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        boolean isHospitalAdmin = user.getRole() != null && user.getRole().getRoleName() == Role.RoleType.hospital_admin;
        boolean isInsurer = user.getRole() != null && user.getRole().getRoleName() == Role.RoleType.insurance_company;

        if (request.getStatus() == FractionalizationRequest.Status.PENDING_ADMIN && !isHospitalAdmin) {
            throw new IllegalArgumentException("Only hospital admin can reject pending admin requests");
        }
        if (request.getStatus() == FractionalizationRequest.Status.PENDING_INSURER && !isInsurer) {
            throw new IllegalArgumentException("Only insurer can reject pending insurer requests");
        }
        if (request.getStatus() != FractionalizationRequest.Status.PENDING_ADMIN && request.getStatus() != FractionalizationRequest.Status.PENDING_INSURER) {
            throw new IllegalArgumentException("Only pending requests can be rejected");
        }

        String reason = req.getRejectionReason();
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        request.setStatus(FractionalizationRequest.Status.REJECTED);
        request.setRejectionReason(reason.trim());
        request.setReviewedBy(user.getUserId());
        request.setReviewedAt(LocalDateTime.now());

        FractionalizationRequest saved = requestRepository.save(request);

        notificationService.notifyUser(
                user.getUserId(),
                request.getPrimaryPatientUserId(),
                "Fractionalization Rejected",
                reason.trim()
        );

        return mapRequestView(saved);
    }

    public List<FractionalAllocationView> listMyBeneficiaryAllocations(String beneficiaryEmail) {
        User user = userRepository.findByEmail(beneficiaryEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return allocationRepository.findByBeneficiaryUserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(this::mapAllocationView)
                .toList();
    }

    public List<FractionalAllocationView> listMyPrimaryAllocations(String primaryEmail) {
        User user = userRepository.findByEmail(primaryEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return allocationRepository.findByPrimaryUserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(this::mapAllocationView)
                .toList();
    }

    @Transactional
    public FractionalAllocationView redeemFromOwnProfile(String beneficiaryEmail, RedeemFractionalHtRequest req) {
        User beneficiary = userRepository.findByEmail(beneficiaryEmail)
                .orElseThrow(() -> new IllegalArgumentException("Beneficiary user not found"));

        if (req.getAllocationId() == null) {
            throw new IllegalArgumentException("Allocation ID is required");
        }

        BigDecimal amount = nz(req.getAmount());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        FractionalHtAllocation allocation = allocationRepository.findById(req.getAllocationId())
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        if (!allocation.getBeneficiaryUserId().equals(beneficiary.getUserId())) {
            throw new IllegalArgumentException("You can only redeem your own allocation");
        }

        if (allocation.getStatus() != FractionalHtAllocation.Status.ACTIVE) {
            throw new IllegalArgumentException("Allocation is not active");
        }

        if (allocation.getNocExpiresAt() != null && !allocation.getNocExpiresAt().isAfter(LocalDateTime.now())) {
            expireSingleAllocation(allocation);
            throw new IllegalArgumentException("NOC has expired; allocation is frozen");
        }

        if (nz(allocation.getRemainingHt()).compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient fractional HT balance");
        }

        allocation.setRemainingHt(nz(allocation.getRemainingHt()).subtract(amount));
        allocationRepository.save(allocation);

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId == null) {
            throw new IllegalStateException("HT token not configured in tokens table");
        }

        Transaction tx = new Transaction();
        tx.setUserId(allocation.getBeneficiaryUserId());
        tx.setTokenId(htTokenId);
        tx.setType(Transaction.TransactionType.DEBIT);
        tx.setAmount(amount);
        tx.setDescription("Beneficiary self-redemption from fractional allocation"
                + (req.getReason() != null && !req.getReason().isBlank() ? ": " + req.getReason().trim() : ""));
        tx.setSenderWalletAddress("FRACTIONAL_ALLOCATION");
        tx.setReceiverWalletAddress("SERVICE_REDEMPTION");
        tx.setTransactionHash("0x" + String.format("%064x", System.currentTimeMillis()));
        tx.setStatus("CONFIRMED");
        tx.setTimestamp(LocalDateTime.now());
        walletTransactionRepository.save(tx);

        ActivityLog beneficiaryActivity = new ActivityLog();
        beneficiaryActivity.setUserId(allocation.getBeneficiaryUserId());
        beneficiaryActivity.setActivityName("Beneficiary Fractional Redemption");
        beneficiaryActivity.setDescription(amount.toPlainString() + " HT redeemed from own profile (allocation " + allocation.getAllocationId() + ")");
        beneficiaryActivity.setType(ActivityLog.ActivityType.ACTION);
        beneficiaryActivity.setStatus("SUCCESS");
        beneficiaryActivity.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(beneficiaryActivity);

        return mapAllocationView(allocation);
    }

    @Transactional
    public FractionalAllocationView redeemForBeneficiaryAtHospital(String staffEmail, RedeemFractionalHtRequest req) {
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new IllegalArgumentException("Staff user not found"));

        Role.RoleType role = staff.getRole() != null ? staff.getRole().getRoleName() : null;
        if (role != Role.RoleType.hospital_staff && role != Role.RoleType.hospital_admin) {
            throw new IllegalArgumentException("Only hospital staff/admin can process beneficiary redemption");
        }

        if (req.getAllocationId() == null) {
            throw new IllegalArgumentException("Allocation ID is required");
        }

        BigDecimal amount = nz(req.getAmount());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        FractionalHtAllocation allocation = allocationRepository.findById(req.getAllocationId())
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        if (staff.getHospitalId() == null || !staff.getHospitalId().equals(allocation.getHospitalId())) {
            throw new IllegalArgumentException("You can only redeem allocations in your hospital");
        }

        if (allocation.getStatus() != FractionalHtAllocation.Status.ACTIVE) {
            throw new IllegalArgumentException("Allocation is not active");
        }

        if (allocation.getNocExpiresAt() != null && !allocation.getNocExpiresAt().isAfter(LocalDateTime.now())) {
            expireSingleAllocation(allocation);
            throw new IllegalArgumentException("NOC has expired; allocation is frozen");
        }

        if (nz(allocation.getRemainingHt()).compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient beneficiary fractional HT balance");
        }

        allocation.setRemainingHt(nz(allocation.getRemainingHt()).subtract(amount));
        allocationRepository.save(allocation);

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId == null) {
            throw new IllegalStateException("HT token not configured in tokens table");
        }

        Transaction tx = new Transaction();
        tx.setUserId(allocation.getBeneficiaryUserId());
        tx.setTokenId(htTokenId);
        tx.setType(Transaction.TransactionType.DEBIT);
        tx.setAmount(amount);
        tx.setDescription("Fractional HT redemption (NOC " + allocation.getNocNumber() + ")"
                + (req.getReason() != null && !req.getReason().isBlank() ? ": " + req.getReason().trim() : ""));
        tx.setSenderWalletAddress("FRACTIONAL_ALLOCATION");
        tx.setReceiverWalletAddress("HOSPITAL_REDEMPTION");
        tx.setTransactionHash("0x" + String.format("%064x", System.currentTimeMillis()));
        tx.setStatus("CONFIRMED");
        tx.setTimestamp(LocalDateTime.now());
        walletTransactionRepository.save(tx);

        ActivityLog beneficiaryActivity = new ActivityLog();
        beneficiaryActivity.setUserId(allocation.getBeneficiaryUserId());
        beneficiaryActivity.setActivityName("Fractional HT Redemption");
        beneficiaryActivity.setDescription(amount.toPlainString() + " HT redeemed from fractional allocation " + allocation.getAllocationId());
        beneficiaryActivity.setType(ActivityLog.ActivityType.ACTION);
        beneficiaryActivity.setStatus("SUCCESS");
        beneficiaryActivity.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(beneficiaryActivity);

        ActivityLog staffActivity = new ActivityLog();
        staffActivity.setUserId(staff.getUserId());
        staffActivity.setActivityName("Processed Beneficiary Fractional Redemption");
        staffActivity.setDescription("Redeemed " + amount.toPlainString() + " HT for beneficiary user " + allocation.getBeneficiaryUserId());
        staffActivity.setType(ActivityLog.ActivityType.ACTION);
        staffActivity.setStatus("SUCCESS");
        staffActivity.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(staffActivity);

        return mapAllocationView(allocation);
    }

    @Transactional
    public FractionalAllocationView revokeAllocation(String primaryEmail, UUID allocationId, RevokeAllocationRequest req) {
        User primaryUser = userRepository.findByEmail(primaryEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FractionalHtAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        if (!allocation.getPrimaryUserId().equals(primaryUser.getUserId())) {
            throw new IllegalArgumentException("Only primary patient can revoke this allocation");
        }

        if (allocation.getStatus() != FractionalHtAllocation.Status.ACTIVE
                && allocation.getStatus() != FractionalHtAllocation.Status.FROZEN) {
            throw new IllegalArgumentException("Only active/frozen allocations can be revoked");
        }

        BigDecimal returnAmount = nz(allocation.getRemainingHt());
        if (returnAmount.compareTo(BigDecimal.ZERO) > 0) {
            Patient primaryPatient = patientRepository.findById(allocation.getPrimaryPatientId())
                    .orElseThrow(() -> new IllegalArgumentException("Primary patient not found"));
            creditPrimarySourceHt(primaryPatient, returnAmount, allocation.getSource());
        }

        allocation.setRemainingHt(BigDecimal.ZERO);
        allocation.setStatus(FractionalHtAllocation.Status.REVOKED);
        allocationRepository.save(allocation);

        ActivityLog activity = new ActivityLog();
        activity.setUserId(primaryUser.getUserId());
        activity.setActivityName("Fractional Allocation Revoked");
        activity.setDescription("Allocation " + allocationId + " revoked"
                + (req != null && req.getReason() != null && !req.getReason().isBlank() ? ": " + req.getReason().trim() : ""));
        activity.setType(ActivityLog.ActivityType.ACTION);
        activity.setStatus("SUCCESS");
        activity.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(activity);

        return mapAllocationView(allocation);
    }

    @Transactional
    public int expireNocAllocations() {
        List<FractionalHtAllocation> expired = allocationRepository.findActiveExpired(LocalDateTime.now());
        int processed = 0;
        for (FractionalHtAllocation allocation : expired) {
            expireSingleAllocation(allocation);
            processed++;
        }
        return processed;
    }

    private void expireSingleAllocation(FractionalHtAllocation allocation) {
        if (allocation.getStatus() != FractionalHtAllocation.Status.ACTIVE) {
            return;
        }

        BigDecimal returnAmount = nz(allocation.getRemainingHt());
        if (returnAmount.compareTo(BigDecimal.ZERO) > 0) {
            Patient primary = patientRepository.findById(allocation.getPrimaryPatientId())
                    .orElseThrow(() -> new IllegalArgumentException("Primary patient not found for expired allocation"));
            creditPrimarySourceHt(primary, returnAmount, allocation.getSource());
        }

        allocation.setRemainingHt(BigDecimal.ZERO);
        allocation.setStatus(FractionalHtAllocation.Status.EXPIRED);
        allocationRepository.save(allocation);

        notificationService.notifyUser(
                allocation.getPrimaryUserId(),
                allocation.getPrimaryUserId(),
                "Fractional NOC Expired",
                "Unspent allocation HT returned to your wallet."
        );
    }

    private FractionalizationRequestView mapRequestView(FractionalizationRequest request) {
        List<FractionalizationRequestView.BeneficiaryRow> beneficiaries = beneficiaryRepository.findByRequestId(request.getRequestId())
                .stream()
                .map(b -> new FractionalizationRequestView.BeneficiaryRow(
                        b.getBeneficiaryUserId(),
                        b.getFractionPercent(),
                        b.getAllocatedHt()))
                .toList();

        return new FractionalizationRequestView(
                request.getRequestId(),
                request.getPrimaryPatientUserId(),
                request.getHospitalId(),
                request.getSource(),
                request.getFractionalizeHtAmount(),
                request.getStatus().name(),
                request.getPatientNote(),
                request.getInsurerName(),
                request.getNocNumber(),
                request.getNocIssuedAt(),
                request.getNocExpiresAt(),
                request.getNocDocument(),
                request.getRejectionReason(),
                request.getCreatedAt(),
                beneficiaries
        );
    }

    private FractionalAllocationView mapAllocationView(FractionalHtAllocation a) {
        return new FractionalAllocationView(
                a.getAllocationId(),
                a.getRequestId(),
                a.getPrimaryUserId(),
                a.getBeneficiaryUserId(),
                a.getSource(),
                a.getTotalAllocatedHt(),
                a.getRemainingHt(),
                a.getStatus().name(),
                a.getInsurerName(),
                a.getNocNumber(),
                a.getNocIssuedAt(),
                a.getNocExpiresAt()
        );
    }

    private void validatePrimaryPatientEligibility(User user, Patient patient) {
        if (patient.getKycStatus() != Patient.KycStatus.APPROVED) {
            throw new IllegalArgumentException("Patient KYC must be approved before fractionalization");
        }
        if (patient.getHospitalId() == null) {
            throw new IllegalArgumentException("Patient hospital is not set");
        }
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new IllegalArgumentException("Patient account must be active");
        }
    }

    private void ensurePrimaryHasSufficientSourceHt(Patient primaryPatient, BigDecimal amount, String source) {
        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(primaryPatient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Primary patient wallet balance not found"));
        if (nz(balance.getTotalHt()).compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient total HT balance");
        }

        String cardName = source.equals("SUBSCRIPTION") ? "Subscription Card" : "Asset Health Card";
        HealthCard card = getOrCreateHealthCard(primaryPatient.getId(), cardName);
        if (nz(card.getHtBalance()).compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient HT in " + cardName);
        }
    }

    private void deductPrimarySourceHt(Patient primaryPatient, BigDecimal amount, String source) {
        String cardName = source.equals("SUBSCRIPTION") ? "Subscription Card" : "Asset Health Card";
        HealthCard sourceCard = getOrCreateHealthCard(primaryPatient.getId(), cardName);

        if (nz(sourceCard.getHtBalance()).compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient HT in " + cardName);
        }

        sourceCard.setHtBalance(nz(sourceCard.getHtBalance()).subtract(amount));
        healthCardRepository.save(sourceCard);

        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(primaryPatient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Primary patient wallet balance not found"));
        if (nz(balance.getTotalHt()).compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient total HT balance");
        }

        balance.setTotalHt(nz(balance.getTotalHt()).subtract(amount));
        balance.setLastUpdated(LocalDateTime.now());
        patientTokenBalanceRepository.save(balance);

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId != null) {
            Transaction tx = new Transaction();
            tx.setUserId(primaryPatient.getUserId());
            tx.setTokenId(htTokenId);
            tx.setType(Transaction.TransactionType.DEBIT);
            tx.setAmount(amount);
            tx.setDescription("HT reserved for fractional allocations (source=" + source + ")");
            tx.setSenderWalletAddress(primaryPatient.getWalletAddress());
            tx.setReceiverWalletAddress("FRACTIONALIZATION_POOL");
            tx.setTransactionHash("0x" + String.format("%064x", System.currentTimeMillis()));
            tx.setStatus("CONFIRMED");
            tx.setTimestamp(LocalDateTime.now());
            walletTransactionRepository.save(tx);
        }
    }

    private void creditPrimarySourceHt(Patient primaryPatient, BigDecimal amount, String source) {
        String cardName = source.equals("SUBSCRIPTION") ? "Subscription Card" : "Asset Health Card";
        HealthCard sourceCard = getOrCreateHealthCard(primaryPatient.getId(), cardName);
        sourceCard.setHtBalance(nz(sourceCard.getHtBalance()).add(amount));
        healthCardRepository.save(sourceCard);

        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(primaryPatient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Primary patient wallet balance not found"));
        balance.setTotalHt(nz(balance.getTotalHt()).add(amount));
        balance.setLastUpdated(LocalDateTime.now());
        patientTokenBalanceRepository.save(balance);

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId != null) {
            Transaction tx = new Transaction();
            tx.setUserId(primaryPatient.getUserId());
            tx.setTokenId(htTokenId);
            tx.setType(Transaction.TransactionType.CREDIT);
            tx.setAmount(amount);
            tx.setDescription("Returned unused fractional HT to primary patient");
            tx.setSenderWalletAddress("FRACTIONALIZATION_POOL");
            tx.setReceiverWalletAddress(primaryPatient.getWalletAddress());
            tx.setTransactionHash("0x" + String.format("%064x", System.currentTimeMillis()));
            tx.setStatus("CONFIRMED");
            tx.setTimestamp(LocalDateTime.now());
            walletTransactionRepository.save(tx);
        }
    }

    private void requireHospitalAdmin(User admin) {
        if (admin.getRole() == null || admin.getRole().getRoleName() != Role.RoleType.hospital_admin) {
            throw new IllegalArgumentException("Only hospital admin can review fractionalization requests");
        }
        if (admin.getHospitalId() == null) {
            throw new IllegalArgumentException("Hospital admin is not mapped to any hospital");
        }
    }

    private void requireInsurer(User insurer) {
        if (insurer.getRole() == null || insurer.getRole().getRoleName() != Role.RoleType.insurance_company) {
            throw new IllegalArgumentException("Only insurance company users can issue NOCs");
        }
    }

    private HealthCard getOrCreateHealthCard(UUID patientId, String cardName) {
        Card card = cardRepository.findByCardNameIgnoreCase(cardName).orElseGet(() -> {
            Card c = new Card();
            c.setCardName(cardName);
            return cardRepository.save(c);
        });

        return healthCardRepository.findByPatientIdAndCardId(patientId, card.getCardId())
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    HealthCard hc = new HealthCard();
                    hc.setPatientId(patientId);
                    hc.setCardId(card.getCardId());
                    hc.setCardNum(generateCardNum());
                    hc.setHtBalance(BigDecimal.ZERO);
                    hc.setExpiryDate(LocalDate.now().plusYears(1));
                    hc.setCvv(String.format("%03d", new Random().nextInt(1000)));
                    return healthCardRepository.save(hc);
                });
    }

    private String normalizeSource(String source) {
        if (source == null || source.isBlank()) {
            throw new IllegalArgumentException("Source is required: SUBSCRIPTION or ASSET");
        }
        String s = source.trim().toUpperCase();
        if (!"SUBSCRIPTION".equals(s) && !"ASSET".equals(s)) {
            throw new IllegalArgumentException("Invalid source. Use SUBSCRIPTION or ASSET");
        }
        return s;
    }

    private void notifyHospitalAdmins(UUID hospitalId, UUID senderId, String title, String body) {
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if (u.getHospitalId() == null || !u.getHospitalId().equals(hospitalId)) {
                continue;
            }
            if (u.getRole() == null || u.getRole().getRoleName() != Role.RoleType.hospital_admin) {
                continue;
            }
            notificationService.notifyUser(senderId, u.getUserId(), title, body);
        }
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private String generateCardNum() {
        Random r = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            sb.append(r.nextInt(10));
        }
        return sb.toString();
    }
}
