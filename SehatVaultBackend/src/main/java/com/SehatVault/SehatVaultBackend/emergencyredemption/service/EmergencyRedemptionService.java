package com.SehatVault.SehatVaultBackend.emergencyredemption.service;

import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.emergencyredemption.dto.ApproveEmergencyRedemptionRequest;
import com.SehatVault.SehatVaultBackend.emergencyredemption.dto.CreateEmergencyRedemptionRequest;
import com.SehatVault.SehatVaultBackend.emergencyredemption.dto.EmergencyRedemptionDto;
import com.SehatVault.SehatVaultBackend.emergencyredemption.dto.RejectEmergencyRedemptionRequest;
import com.SehatVault.SehatVaultBackend.emergencyredemption.entity.EmergencyRedemptionRequest;
import com.SehatVault.SehatVaultBackend.emergencyredemption.repository.EmergencyRedemptionRequestRepository;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.marketplace.entity.PatientAtAssignment;
import com.SehatVault.SehatVaultBackend.marketplace.repository.PatientAtAssignmentRepository;
import com.SehatVault.SehatVaultBackend.notification.service.NotificationService;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import com.SehatVault.SehatVaultBackend.blockchain.model.BlockchainTxRef;
import com.SehatVault.SehatVaultBackend.blockchain.service.TokenContractGateway;
import com.SehatVault.SehatVaultBackend.blockchain.util.TokenUnitConverter;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmergencyRedemptionService {

    private final EmergencyRedemptionRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final PatientAtAssignmentRepository patientAtAssignmentRepository;
    private final WalletTransactionRepository walletTransactionRepository;
        private final TokenContractGateway tokenContractGateway;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;
    private final CardRepository cardRepository;
    private final HealthCardRepository healthCardRepository;

    @Transactional
    public EmergencyRedemptionDto submit(String patientEmail, CreateEmergencyRedemptionRequest request) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        BigDecimal requestedAt = nz(request.getRequestedAtAmount());
        if (requestedAt.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Requested AT amount must be greater than zero");
        }

        if (!Boolean.TRUE.equals(request.getTradeoffAcknowledged())) {
            throw new IllegalArgumentException("You must acknowledge the trade-off before submitting");
        }

        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient wallet balance not found"));

        if (nz(balance.getTotalAt()).compareTo(requestedAt) < 0) {
            throw new IllegalArgumentException("Requested AT exceeds your available AT balance");
        }

        if (patient.getHospitalId() == null) {
            throw new IllegalArgumentException("Patient hospital is not set");
        }

        // Asset selection — must be a Pool 1 (WITH_PATIENT) assignment with enough AT.
        UUID assetId = request.getAssetId();
        if (assetId == null) {
            throw new IllegalArgumentException("Please select the asset (in Pool 1) to redeem against");
        }
        PatientAtAssignment assignment = patientAtAssignmentRepository
                .findByPatientIdAndAssetId(patient.getId(), assetId)
                .orElseThrow(() -> new IllegalArgumentException("AT assignment not found for the selected asset"));
        if (assignment.getAvailabilityStatus() != PatientAtAssignment.AvailabilityStatus.WITH_PATIENT) {
            throw new IllegalArgumentException("This asset is not in Pool 1 — only Pool 1 (Available) AT can be redeemed");
        }
        if (nz(assignment.getAvailableAt()).compareTo(requestedAt) < 0) {
            throw new IllegalArgumentException(
                    "Requested AT exceeds the available AT (" + assignment.getAvailableAt() + ") on the selected asset");
        }

        EmergencyRedemptionRequest entity = new EmergencyRedemptionRequest();
        entity.setPatientId(patient.getId());
        entity.setPatientUserId(patient.getUserId());
        entity.setHospitalId(patient.getHospitalId());
        entity.setAssetId(assetId);
        entity.setStatus(EmergencyRedemptionRequest.Status.PENDING);
        entity.setRequestedAtAmount(requestedAt);
        entity.setPatientReason(request.getPatientReason());
        entity.setSupportingDocuments(request.getSupportingDocuments());
        entity.setTradeoffAcknowledged(true);

        EmergencyRedemptionRequest saved = requestRepository.save(entity);

        Set<UUID> reviewers = userRepository.findAll().stream()
                .filter(u -> u.getHospitalId() != null && u.getHospitalId().equals(patient.getHospitalId()))
                .filter(u -> u.getRole() != null)
                .filter(u -> {
                    Role.RoleType role = u.getRole().getRoleName();
                    return role == Role.RoleType.hospital_admin || role == Role.RoleType.hospital_staff;
                })
                .map(User::getUserId)
                .collect(java.util.stream.Collectors.toSet());
        notificationService.notifyUsers(
                user.getUserId(),
                reviewers,
                "Emergency Redemption Request",
                "A patient submitted an emergency AT to HT redemption request requiring review."
        );
        return toDto(saved);
    }

    public List<EmergencyRedemptionDto> listForPatient(UUID patientUserId) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        return requestRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    public List<EmergencyRedemptionDto> listPendingForHospitalStaff(String staffEmail) {
        User staffUser = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new IllegalArgumentException("Staff account not found"));

        Role.RoleType role = staffUser.getRole() != null ? staffUser.getRole().getRoleName() : null;
        if (role != Role.RoleType.hospital_staff && role != Role.RoleType.hospital_admin) {
            throw new IllegalArgumentException("Only hospital staff/admin can review emergency redemptions");
        }

        if (staffUser.getHospitalId() == null) {
            throw new IllegalArgumentException("Staff hospital is not set");
        }

        return requestRepository.findByHospitalIdAndStatusOrderByCreatedAtAsc(
                        staffUser.getHospitalId(), EmergencyRedemptionRequest.Status.PENDING)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public EmergencyRedemptionDto approve(String staffEmail, UUID requestId, ApproveEmergencyRedemptionRequest req) {
        User staffUser = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new IllegalArgumentException("Staff account not found"));

        Role.RoleType role = staffUser.getRole() != null ? staffUser.getRole().getRoleName() : null;
        if (role != Role.RoleType.hospital_staff && role != Role.RoleType.hospital_admin) {
            throw new IllegalArgumentException("Only hospital staff/admin can approve emergency redemptions");
        }

        EmergencyRedemptionRequest entity = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (entity.getStatus() != EmergencyRedemptionRequest.Status.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be approved/rejected");
        }

        if (staffUser.getHospitalId() == null || !staffUser.getHospitalId().equals(entity.getHospitalId())) {
            throw new IllegalArgumentException("You can only process requests for your hospital");
        }

        BigDecimal atToConvert = nz(req.getAtToConvert());
        if (atToConvert.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("AT to convert must be greater than zero");
        }
        if (atToConvert.compareTo(nz(entity.getRequestedAtAmount())) > 0) {
            throw new IllegalArgumentException("AT to convert cannot exceed the patient requested amount");
        }

        BigDecimal rate = nz(req.getConversionRate());
        if (rate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Conversion rate must be greater than zero");
        }

        EmergencyRedemptionRequest.UrgencyLevel urgency = parseUrgency(req.getUrgencyLevel());

        Patient patient = patientRepository.findById(entity.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        // Deduct AT from patient wallet
        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient wallet balance not found"));

        BigDecimal currentAt = nz(balance.getTotalAt());
        if (currentAt.compareTo(atToConvert) < 0) {
            throw new IllegalArgumentException("Insufficient AT balance");
        }

        // Deduct AT from the specific Pool 1 asset selected on the request.
        deductAtFromSpecificAsset(patient.getId(), entity.getAssetId(), atToConvert);

        balance.setTotalAt(currentAt.subtract(atToConvert));

        // Credit HT
        BigDecimal htIssued = atToConvert.multiply(rate).setScale(6, RoundingMode.HALF_UP);
        balance.setTotalHt(nz(balance.getTotalHt()).add(htIssued));
        balance.setLastUpdated(LocalDateTime.now());
        patientTokenBalanceRepository.save(balance);

        // Credit Asset Health Card bucket HT
        HealthCard assetCard = getOrCreateAssetHealthCard(patient.getId());
        assetCard.setHtBalance(nz(assetCard.getHtBalance()).add(htIssued));
        healthCardRepository.save(assetCard);

        // Transactions
        UUID atTokenId = walletTransactionRepository.findTokenIdBySymbol("AT");
        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (atTokenId == null || htTokenId == null) {
            throw new IllegalStateException("AT/HT tokens are not configured in tokens table");
        }

        BlockchainTxRef burnAtTx = tokenContractGateway.burnAT(
            patient.getWalletAddress(),
            TokenUnitConverter.toBaseUnits(atToConvert, 18)
        );
        BlockchainTxRef mintHtTx = tokenContractGateway.mintHT(
            patient.getWalletAddress(),
            TokenUnitConverter.toBaseUnits(htIssued, 18)
        );

        Transaction debitAt = new Transaction();
        debitAt.setUserId(patient.getUserId());
        debitAt.setTokenId(atTokenId);
        debitAt.setType(Transaction.TransactionType.DEBIT);
        debitAt.setAmount(atToConvert);
        debitAt.setDescription("Emergency conversion: AT→HT (approved by " + staffUser.getEmail() + ")");
        debitAt.setSenderWalletAddress(patient.getWalletAddress());
        debitAt.setReceiverWalletAddress("EMERGENCY_CONVERSION");
        debitAt.setTransactionHash(burnAtTx.getTransactionHash());
        debitAt.setBlockNumber(burnAtTx.getBlockNumber());
        debitAt.setStatus("CONFIRMED");
        debitAt.setTimestamp(LocalDateTime.now());
        walletTransactionRepository.save(debitAt);

        Transaction creditHt = new Transaction();
        creditHt.setUserId(patient.getUserId());
        creditHt.setTokenId(htTokenId);
        creditHt.setType(Transaction.TransactionType.CREDIT);
        creditHt.setAmount(htIssued);
        creditHt.setDescription("Emergency conversion: AT→HT (urgency=" + urgency + ")");
        creditHt.setSenderWalletAddress("EMERGENCY_CONVERSION");
        creditHt.setReceiverWalletAddress(patient.getWalletAddress());
        creditHt.setTransactionHash(mintHtTx.getTransactionHash());
        creditHt.setBlockNumber(mintHtTx.getBlockNumber());
        creditHt.setStatus("CONFIRMED");
        creditHt.setTimestamp(LocalDateTime.now());
        walletTransactionRepository.save(creditHt);

        ActivityLog patientActivity = new ActivityLog();
        patientActivity.setUserId(patient.getUserId());
        patientActivity.setActivityName("Emergency AT→HT Conversion");
        patientActivity.setDescription(String.format("%s AT converted to %s HT (urgency=%s)",
                atToConvert.toPlainString(), htIssued.toPlainString(), urgency));
        patientActivity.setType(ActivityLog.ActivityType.ACTION);
        patientActivity.setStatus("SUCCESS");
        patientActivity.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(patientActivity);

        ActivityLog staffActivity = new ActivityLog();
        staffActivity.setUserId(staffUser.getUserId());
        staffActivity.setActivityName("Approved Emergency Conversion");
        staffActivity.setDescription(String.format("Approved emergency conversion for patient %s: %s AT → %s HT (urgency=%s)",
                patient.getId(), atToConvert.toPlainString(), htIssued.toPlainString(), urgency));
        staffActivity.setType(ActivityLog.ActivityType.ACTION);
        staffActivity.setStatus("SUCCESS");
        staffActivity.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(staffActivity);

        notificationService.notifyUser(
                staffUser.getUserId(),
                patient.getUserId(),
                "Emergency Conversion Approved",
                htIssued.toPlainString() + " HT has been credited after converting "
                        + atToConvert.toPlainString() + " AT."
        );

        // Update request record (audit trail)
        entity.setStatus(EmergencyRedemptionRequest.Status.APPROVED);
        entity.setReviewedBy(staffUser.getUserId());
        entity.setReviewedAt(LocalDateTime.now());
        entity.setUrgencyLevel(urgency);
        entity.setApprovedAtAmount(atToConvert);
        entity.setConversionRate(rate);
        entity.setHtIssued(htIssued);
        entity.setStaffJustification(req.getStaffJustification());
        entity.setRejectionReason(null);

        EmergencyRedemptionRequest saved = requestRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public EmergencyRedemptionDto reject(String staffEmail, UUID requestId, RejectEmergencyRedemptionRequest req) {
        User staffUser = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new IllegalArgumentException("Staff account not found"));

        Role.RoleType role = staffUser.getRole() != null ? staffUser.getRole().getRoleName() : null;
        if (role != Role.RoleType.hospital_staff && role != Role.RoleType.hospital_admin) {
            throw new IllegalArgumentException("Only hospital staff/admin can reject emergency redemptions");
        }

        EmergencyRedemptionRequest entity = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (entity.getStatus() != EmergencyRedemptionRequest.Status.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be approved/rejected");
        }

        if (staffUser.getHospitalId() == null || !staffUser.getHospitalId().equals(entity.getHospitalId())) {
            throw new IllegalArgumentException("You can only process requests for your hospital");
        }

        String reason = req.getRejectionReason();
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        Patient patient = patientRepository.findById(entity.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        entity.setStatus(EmergencyRedemptionRequest.Status.REJECTED);
        entity.setReviewedBy(staffUser.getUserId());
        entity.setReviewedAt(LocalDateTime.now());
        entity.setRejectionReason(reason.trim());

        EmergencyRedemptionRequest saved = requestRepository.save(entity);

        notificationService.notifyUser(
                staffUser.getUserId(),
                patient.getUserId(),
                "Emergency Conversion Rejected",
                reason.trim()
        );

        return toDto(saved);
    }

    /**
     * Deduct AT from one specific Pool 1 asset (chosen by the patient at submit time).
     * Reduces both `available_at` and `total_at_assigned` on that single
     * `patient_at_assignments` row, so the asset's remaining AT shrinks in both the
     * patient portal and the hospital Pool Management view.
     */
    private void deductAtFromSpecificAsset(UUID patientId, UUID assetId, BigDecimal atToConvert) {
        if (assetId == null) {
            throw new IllegalArgumentException("Asset to redeem against is missing on the request");
        }
        PatientAtAssignment a = patientAtAssignmentRepository
                .findByPatientIdAndAssetId(patientId, assetId)
                .orElseThrow(() -> new IllegalArgumentException("AT assignment not found for the selected asset"));

        if (a.getAvailabilityStatus() != PatientAtAssignment.AvailabilityStatus.WITH_PATIENT) {
            throw new IllegalArgumentException("Selected asset is no longer in Pool 1 — cannot redeem");
        }

        BigDecimal available = nz(a.getAvailableAt());
        if (available.compareTo(atToConvert) < 0) {
            throw new IllegalArgumentException(
                    "Selected asset has only " + available + " AT in Pool 1; requested " + atToConvert);
        }

        a.setAvailableAt(available.subtract(atToConvert));
        a.setTotalAtAssigned(nz(a.getTotalAtAssigned()).subtract(atToConvert));
        patientAtAssignmentRepository.save(a);
    }

    private void deductAtFromAssignments(UUID patientId, UUID hospitalId, BigDecimal atToConvert) {
        BigDecimal remaining = atToConvert;

        List<PatientAtAssignment> assignments = patientAtAssignmentRepository
                .findAvailableAtByPatientIdAndHospitalIdOldestFirst(patientId, hospitalId);

        for (PatientAtAssignment a : assignments) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            BigDecimal available = nz(a.getAvailableAt());
            if (available.compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal take = available.min(remaining);

            a.setAvailableAt(available.subtract(take));
            a.setTotalAtAssigned(nz(a.getTotalAtAssigned()).subtract(take));

            // keep unavailableAt as-is; in pre-trade window it should be 0.
            patientAtAssignmentRepository.save(a);

            remaining = remaining.subtract(take);
        }

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("Insufficient available AT assigned for conversion");
        }
    }

    private HealthCard getOrCreateAssetHealthCard(UUID patientId) {
        Card card = cardRepository.findByCardNameIgnoreCase("Asset Health Card").orElseGet(() -> {
            Card c = new Card();
            c.setCardName("Asset Health Card");
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

    private String generateCardNum() {
        Random r = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            sb.append(r.nextInt(10));
        }
        return sb.toString();
    }

    private EmergencyRedemptionRequest.UrgencyLevel parseUrgency(String urgencyLevel) {
        if (urgencyLevel == null || urgencyLevel.isBlank()) {
            throw new IllegalArgumentException("Urgency level is required");
        }
        try {
            return EmergencyRedemptionRequest.UrgencyLevel.valueOf(urgencyLevel.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid urgency level. Use ROUTINE, MODERATE, or CRITICAL");
        }
    }

    private EmergencyRedemptionDto toDto(EmergencyRedemptionRequest e) {
        return EmergencyRedemptionDto.builder()
                .requestId(e.getRequestId())
                .patientId(e.getPatientId())
                .patientUserId(e.getPatientUserId())
                .hospitalId(e.getHospitalId())
                .assetId(e.getAssetId())
                .status(e.getStatus())
                .requestedAtAmount(e.getRequestedAtAmount())
                .patientReason(e.getPatientReason())
                .supportingDocuments(e.getSupportingDocuments())
                .tradeoffAcknowledged(e.getTradeoffAcknowledged())
                .reviewedBy(e.getReviewedBy())
                .reviewedAt(e.getReviewedAt())
                .urgencyLevel(e.getUrgencyLevel())
                .approvedAtAmount(e.getApprovedAtAmount())
                .conversionRate(e.getConversionRate())
                .htIssued(e.getHtIssued())
                .staffJustification(e.getStaffJustification())
                .rejectionReason(e.getRejectionReason())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}
