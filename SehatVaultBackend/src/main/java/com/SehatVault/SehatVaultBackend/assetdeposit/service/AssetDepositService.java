package com.SehatVault.SehatVaultBackend.assetdeposit.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.dto.AssetDepositDto;
import com.SehatVault.SehatVaultBackend.assetdeposit.dto.HospitalOptionDto;
import com.SehatVault.SehatVaultBackend.assetdeposit.dto.SubmitAssetDepositRequest;
import com.SehatVault.SehatVaultBackend.assetdeposit.dto.BankCustodyVerificationDto;
import com.SehatVault.SehatVaultBackend.assetdeposit.dto.ConfirmCustodyRequest;
import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.entity.BankCustodyVerification;
import com.SehatVault.SehatVaultBackend.assetdeposit.entity.MintRecord;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.MintRecordRepository;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.BankCustodyVerificationRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.bank.entity.Bank;
import com.SehatVault.SehatVaultBackend.bank.repository.BankRepository;
import com.SehatVault.SehatVaultBackend.bankintegration.entity.Partnership;
import com.SehatVault.SehatVaultBackend.bankintegration.repository.PartnershipRepository;
import com.SehatVault.SehatVaultBackend.patient.service.PatientWalletAllocatorService;
import com.SehatVault.SehatVaultBackend.wallet.service.TokenPriceService;
import com.SehatVault.SehatVaultBackend.blockchain.model.BlockchainTxRef;
import com.SehatVault.SehatVaultBackend.blockchain.service.TokenContractGateway;
import com.SehatVault.SehatVaultBackend.blockchain.util.TokenUnitConverter;
import com.SehatVault.SehatVaultBackend.blockchain.util.UuidUint256;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import com.SehatVault.SehatVaultBackend.marketplace.repository.PatientAtAssignmentRepository;
import com.SehatVault.SehatVaultBackend.marketplace.service.AtTradingService;
import com.SehatVault.SehatVaultBackend.marketplace.service.HospitalAtPoolService;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetDepositService {

    private final TokenPriceService tokenPriceService;
        private final TokenContractGateway tokenContractGateway;
    private final AssetDepositRepository assetDepositRepository;
    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final HealthCardRepository healthCardRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final BankRepository bankRepository;
    private final PartnershipRepository partnershipRepository;
    private final MintRecordRepository mintRecordRepository;
    private final HospitalAtPoolService hospitalAtPoolService;
    private final PatientAtAssignmentRepository patientAtAssignmentRepository;
    private final BankCustodyVerificationRepository bankCustodyVerificationRepository;
    private final PatientWalletAllocatorService patientWalletAllocatorService;
    private final AtTradingService atTradingService;
    private final NotificationService notificationService;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public List<HospitalOptionDto> getHospitalOptions() {
        return hospitalRepository.findAll().stream()
                .map(hospital -> {
                    HospitalOptionDto dto = new HospitalOptionDto();
                    dto.setHospitalId(hospital.getHospitalId());
                    dto.setHospitalName(hospital.getHospitalName());
                    dto.setCity(hospital.getCity());
                    return dto;
                })
                .toList();
    }

    @Transactional
    public AssetDepositDto submitRequest(String email, SubmitAssetDepositRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getAssetType() == null || request.getAssetType().isBlank()) {
            throw new IllegalArgumentException("assetType is required");
        }
        if (request.getAssetValue() == null || request.getAssetValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("assetValue must be greater than 0");
        }
        if (request.getAssetReceipt() == null || request.getAssetReceipt().isBlank()) {
            throw new IllegalArgumentException("assetReceipt is required");
        }
        if (request.getPurityCertificate() == null || request.getPurityCertificate().isBlank()) {
            throw new IllegalArgumentException("purityCertificate is required");
        }
        if (request.getSupportingDocuments() == null || request.getSupportingDocuments().isBlank()) {
            throw new IllegalArgumentException("supportingDocuments is required");
        }

        User user = requireUser(email);
        requireRole(user, Role.RoleType.patient, "Only patients can submit deposit requests");

        Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        if (patient.getKycStatus() != Patient.KycStatus.APPROVED) {
            throw new IllegalArgumentException("KYC must be approved before submitting a deposit request");
        }

        UUID resolvedHospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : user.getHospitalId();
        if (resolvedHospitalId == null) {
            throw new IllegalArgumentException("Hospital is not assigned to this patient profile");
        }

        Hospital hospital = hospitalRepository.findById(resolvedHospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Assigned hospital was not found"));

        user.setHospitalId(hospital.getHospitalId());
        userRepository.save(user);
        patient.setHospitalId(hospital.getHospitalId());
        patient.setHasAsset(true);
        patientRepository.save(patient);

        AssetDeposit deposit = new AssetDeposit();
        deposit.setPatientId(patient.getId());
        deposit.setBankId(null); // Bank assigned when hospital admin approves and forwards
        deposit.setAssetType(normalizeAssetType(request.getAssetType()));
        deposit.setAssetValue(request.getAssetValue());
        deposit.setAssetReceipt(request.getAssetReceipt().trim());
        deposit.setPurityCertificate(request.getPurityCertificate().trim());
        deposit.setSupportingDocuments(request.getSupportingDocuments().trim());
        deposit.setWeight(request.getWeight());
        deposit.setStatus("pending");
        deposit.setBankApprovalStatus(null);
        deposit.setSubmittedAt(LocalDateTime.now());

        AssetDeposit saved = assetDepositRepository.save(deposit);

        // Notify hospital admins about new deposit request
        notifyHospitalAdmins(hospital.getHospitalId(), user.getUserId(),
                "New Asset Deposit Request",
                "Patient " + user.getName() + " submitted a " + saved.getAssetType()
                        + " deposit worth PKR " + saved.getAssetValue());

        return toDto(saved, patient, user, hospital);
    }

    @Transactional(readOnly = true)
    public List<AssetDepositDto> getHospitalRequests(String email, String status) {
        User user = requireUser(email);
        requireRole(user, Role.RoleType.hospital_admin, "Only hospital admins can view hospital deposit requests");

        UUID hospitalId = user.getHospitalId();
        if (hospitalId == null) {
            throw new IllegalArgumentException("Hospital is not linked to this account");
        }

        List<AssetDeposit> deposits = assetDepositRepository.findAllByHospitalId(hospitalId);
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            String normalized = status.trim().toLowerCase(Locale.ROOT);
            deposits = deposits.stream()
                    .filter(item -> normalized.equalsIgnoreCase(nz(item.getStatus())))
                    .toList();
        }

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        return deposits.stream()
                .map(deposit -> {
                    Patient patient = patientRepository.findById(deposit.getPatientId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Patient not found for deposit " + deposit.getAssetId()));
                    User patientUser = userRepository.findById(patient.getUserId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "User not found for patient " + patient.getId()));
                    return toDto(deposit, patient, patientUser, hospital);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssetDepositDto> getMyRequests(String email, String status) {
        User user = requireUser(email);
        requireRole(user, Role.RoleType.patient, "Only patients can view their deposit requests");

        Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        List<AssetDeposit> deposits = assetDepositRepository.findByPatientIdOrderBySubmittedAtDesc(patient.getId());
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            String normalized = status.trim().toLowerCase(Locale.ROOT);
            deposits = deposits.stream()
                    .filter(item -> normalized.equalsIgnoreCase(nz(item.getStatus())))
                    .toList();
        }

        UUID hospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : user.getHospitalId();
        Hospital hospital = hospitalId != null
                ? hospitalRepository.findById(hospitalId).orElse(null)
                : null;

        return deposits.stream()
                .map(deposit -> {
                    Hospital resolvedHospital = hospital;
                    if (resolvedHospital == null) {
                        resolvedHospital = new Hospital();
                        resolvedHospital.setHospitalId(null);
                        resolvedHospital.setHospitalName("Not Assigned");
                    }
                    return toDto(deposit, patient, user, resolvedHospital);
                })
                .toList();
    }

    @Transactional
    public AssetDepositDto approveRequest(String email, UUID assetId, UUID bankId) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can approve deposit requests");

        AssetDeposit deposit = assetDepositRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Deposit request not found"));

        Patient patient = patientRepository.findById(deposit.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        assertSameHospital(admin, patient);

        if (!"pending".equalsIgnoreCase(nz(deposit.getStatus()))) {
            throw new IllegalArgumentException("Only pending requests can be approved by hospital");
        }

        // Resolve bank: use provided bankId, or auto-pick if only one integrated bank
        UUID resolvedBankId = bankId;
        if (resolvedBankId == null) {
            List<Partnership> approvedPartnerships = partnershipRepository
                    .findByHospitalIdOrderByCreatedAtDesc(admin.getHospitalId())
                    .stream()
                    .filter(p -> p.getIntegrationStatus() == Partnership.IntegrationStatus.APPROVED)
                    .toList();
            if (approvedPartnerships.isEmpty()) {
                throw new IllegalArgumentException("No bank is integrated with this hospital.");
            }
            if (approvedPartnerships.size() > 1) {
                throw new IllegalArgumentException("Multiple banks integrated. Please select which bank to forward to.");
            }
            resolvedBankId = approvedPartnerships.get(0).getBankId();
        }

        deposit.setStatus("approved");
        deposit.setApprovedAt(LocalDateTime.now());
        deposit.setRejectedAt(null);
        deposit.setRejectionReason(null);
        deposit.setBankId(resolvedBankId);
        deposit.setBankApprovalStatus("pending");
        deposit.setBankApprovedAt(null);
        deposit.setBankRejectedAt(null);
        deposit.setBankRejectionReason(null);

        AssetDeposit saved = assetDepositRepository.save(deposit);
        User patientUser = userRepository.findById(patient.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient user not found"));
        Hospital hospital = hospitalRepository.findById(admin.getHospitalId())
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        // Notify patient that deposit was approved by hospital
        sendNotification(admin.getUserId(), patientUser.getUserId(),
                "Deposit Approved by Hospital",
                "Your " + saved.getAssetType() + " deposit worth PKR " + saved.getAssetValue()
                        + " has been approved by " + hospital.getHospitalName() + ". Awaiting bank approval.");

        // Notify bank staff about new deposit for approval (include hospital and asset details)
        notifyBankStaff(saved.getBankId(), admin.getUserId(),
            "New Deposit for Bank Approval",
            "Hospital: " + hospital.getHospitalName()
                + " | Asset: " + saved.getAssetType() + " (PKR " + saved.getAssetValue() + ")"
                + " | Patient: " + patientUser.getName() + " (" + patientUser.getEmail() + ") - needs bank approval.");

        return toDto(saved, patient, patientUser, hospital);
    }

       @Transactional
       public BankCustodyVerificationDto confirmCustody(String email, UUID assetId, ConfirmCustodyRequest request) {
           // Validation
           if (!request.isValid()) {
               throw new IllegalArgumentException("Invalid custody request: " + request.getValidationError());
           }

           User bankUser = requireUser(email);
           requireRole(bankUser, Role.RoleType.bank_staff, "Only bank staff can confirm custody");

           Bank bank = bankRepository.findByEmail(bankUser.getEmail())
                   .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));

           AssetDeposit deposit = assetDepositRepository.findById(assetId)
                   .orElseThrow(() -> new IllegalArgumentException("Deposit request not found"));

           assertSameBank(bank, deposit);
           if (!"approved".equalsIgnoreCase(nz(deposit.getBankApprovalStatus()))) {
               throw new IllegalArgumentException("Request must be bank-approved before confirming custody");
           }

           // Create custody verification record
           BankCustodyVerification verification = new BankCustodyVerification(
               deposit,
               request.getVerifiedPurityPercent(),
               request.getVerifiedWeightGrams(),
               request.getAssetCondition(),
               request.getSerialNumber(),
               request.getLoanAmountApprovedPkr(),
               request.getLoanInterestRatePercent(),
               bankUser.getUserId().toString()
           );
           verification.setVerificationNotes(request.getVerificationNotes());
           verification.setCustodyReceivedAt(LocalDateTime.now());

           BankCustodyVerification savedVerification = bankCustodyVerificationRepository.save(verification);

           // Update deposit status — mark as fully custody-confirmed.
           // NOTE: AT minting is no longer done here. Bank confirms physical custody only;
           // the hospital admin then mints AT via the /mint-tokens endpoint.
           deposit.setCustodyStatus("confirmed");
           deposit.setCustodyConfirmedAt(LocalDateTime.now());
           deposit.setCustodyConfirmedBy(bankUser.getUserId());
           deposit.setStatus("custody_confirmed");

           // Get patient and hospital info for notifications
           Patient patient = patientRepository.findById(deposit.getPatientId())
                   .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
           User patientUser = userRepository.findById(patient.getUserId())
                   .orElseThrow(() -> new IllegalArgumentException("Patient user not found"));
           UUID hospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : patientUser.getHospitalId();

           deposit.setBaselineHtPerMonth(BigDecimal.ZERO);
           deposit.setLastBaselineHtAt(null);

           assetDepositRepository.save(deposit);

           // Ensure patient has an Asset-based Health Card created immediately upon custody confirmation.
           // Create with 0 HT balance so the card exists for the patient UI; monthly baseline credits
           // will be applied by the scheduled baseline processor when configured.
           try {
               creditAssetHealthCard(patient.getId(), BigDecimal.ZERO);
           } catch (Exception e) {
               log.warn("Failed to create asset health card after custody confirmation: {}", e.getMessage());
           }

           // Notify patient
           sendNotification(bankUser.getUserId(), patientUser.getUserId(),
               "Custody Confirmed — Awaiting Token Mint",
               "Bank confirmed physical custody of your " + deposit.getAssetType() + " deposit. "
                   + "Hospital will mint your AT shortly.");

           // Notify hospital admin so they can mint
           notifyHospitalAdmins(hospitalId, bankUser.getUserId(),
               "Custody Confirmed — Mint Required",
               "Patient " + patientUser.getName() + " custody confirmed by bank. "
                   + "Mint AT for this deposit from the Deposits page.");

           return toCustodyDto(savedVerification, deposit);
       }

    /**
     * Hospital admin mints AT for a deposit whose custody has been confirmed by the bank.
     * Idempotent: rejects if AT was already minted for this asset (mintRecord row exists).
     */
    @Transactional
    public AssetDepositDto mintTokensForDeposit(String email, UUID assetId) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can mint AT for a deposit");

        AssetDeposit deposit = assetDepositRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Deposit not found"));

        Patient patient = patientRepository.findById(deposit.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        assertSameHospital(admin, patient);

        if (!"custody_confirmed".equalsIgnoreCase(nz(deposit.getStatus()))) {
            throw new IllegalArgumentException("Custody must be confirmed before minting AT");
        }

        if (Boolean.TRUE.equals(deposit.getMinted())) {
            throw new IllegalArgumentException("AT has already been minted for this deposit");
        }

        BigDecimal alreadyMinted = nzNum(mintRecordRepository.sumTokensMintedByAssetId(assetId));
        if (alreadyMinted.compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("AT has already been minted for this deposit");
        }

        BigDecimal atTokens = nzNum(deposit.getAssetValue())
                .divide(tokenPriceService.getAtPricePkr(), 2, RoundingMode.DOWN);
        validateMintCap(deposit, atTokens);

        patientWalletAllocatorService.assignWalletToPatient(patient);

        PatientTokenBalance balance = patientTokenBalanceRepository
                .findByPatientId(patient.getId())
                .orElseGet(() -> {
                    PatientTokenBalance b = new PatientTokenBalance();
                    b.setPatientId(patient.getId());
                    b.setTotalAt(BigDecimal.ZERO);
                    b.setTotalHt(BigDecimal.ZERO);
                    b.setLastUpdated(LocalDateTime.now());
                    return b;
                });
        balance.setTotalAt(nzNum(balance.getTotalAt()).add(atTokens));
        balance.setLastUpdated(LocalDateTime.now());
        patientTokenBalanceRepository.save(balance);

        recordMint(deposit, patient.getId(), admin.getUserId(), atTokens, null);

        // Mark deposit as minted to prevent double-minting in future. Persist immediately.
        deposit.setMinted(Boolean.TRUE);
        assetDepositRepository.save(deposit);

        // Ensure the patient's Asset Health Card exists so the UI shows it immediately.
        try {
            creditAssetHealthCard(patient.getId(), BigDecimal.ZERO);
        } catch (Exception e) {
            log.warn("Failed to create asset health card after minting: {}", e.getMessage());
        }

        UUID hospitalId = admin.getHospitalId();
        atTradingService.initializeAtAssignmentWithPatient(
                patient.getId(), deposit.getAssetId(), hospitalId, atTokens);

        User patientUser = userRepository.findById(patient.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient user not found"));
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        sendNotification(admin.getUserId(), patientUser.getUserId(),
                "AT Minted — In Pool 1",
                atTokens.toPlainString() + " AT minted to your Pool 1 (Available). "
                    + "Idle and redeemable now. Trading HT starts when hospital moves to Pool 2.");

        notifyHospitalAdmins(hospitalId, admin.getUserId(),
                "AT Minted — Pool 1",
                patientUser.getName() + ": " + atTokens.toPlainString()
                    + " AT minted into Pool 1. Move to Pool 2 from Pool Management when ready.");

        return toDto(deposit, patient, patientUser, hospital);
    }
    @Transactional
    public AssetDepositDto rejectRequest(String email, UUID assetId, String reason) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can reject deposit requests");

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        AssetDeposit deposit = assetDepositRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Deposit request not found"));

        Patient patient = patientRepository.findById(deposit.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        assertSameHospital(admin, patient);

        if (!"pending".equalsIgnoreCase(nz(deposit.getStatus()))) {
            throw new IllegalArgumentException("Only pending requests can be rejected by hospital");
        }

        deposit.setStatus("rejected");
        deposit.setRejectedAt(LocalDateTime.now());
        deposit.setRejectionReason(reason.trim());
        deposit.setBankApprovalStatus(null);
        deposit.setBankApprovedAt(null);
        deposit.setBankRejectedAt(null);
        deposit.setBankRejectionReason(null);

        AssetDeposit saved = assetDepositRepository.save(deposit);
        User patientUser = userRepository.findById(patient.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient user not found"));
        Hospital hospital = hospitalRepository.findById(admin.getHospitalId())
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        // Notify patient that deposit was rejected by hospital
        sendNotification(admin.getUserId(), patientUser.getUserId(),
                "Deposit Rejected by Hospital",
                "Your " + saved.getAssetType() + " deposit worth PKR " + saved.getAssetValue()
                        + " was rejected by " + hospital.getHospitalName() + ". Reason: " + reason.trim());

        return toDto(saved, patient, patientUser, hospital);
    }

    @Transactional(readOnly = true)
    public List<AssetDepositDto> getBankRequests(String email, String bankStatus) {
        User bankUser = requireUser(email);
        requireRole(bankUser, Role.RoleType.bank_staff, "Only bank staff can view bank deposit requests");

        Bank bank = bankRepository.findByEmail(bankUser.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));

        List<AssetDeposit> deposits = assetDepositRepository.findByBankIdOrderBySubmittedAtDesc(bank.getBankId())
                .stream()
                .filter(item -> "approved".equalsIgnoreCase(nz(item.getStatus())))
                .toList();

        if (bankStatus != null && !bankStatus.isBlank() && !"all".equalsIgnoreCase(bankStatus)) {
            String normalized = bankStatus.trim().toLowerCase(Locale.ROOT);
            deposits = deposits.stream()
                    .filter(item -> normalized.equalsIgnoreCase(nz(item.getBankApprovalStatus())))
                    .toList();
        }

        return deposits.stream()
                .map(deposit -> {
                    Patient patient = patientRepository.findById(deposit.getPatientId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Patient not found for deposit " + deposit.getAssetId()));
                    User patientUser = userRepository.findById(patient.getUserId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "User not found for patient " + patient.getId()));
                    UUID hospitalId = patient.getHospitalId() != null ? patient.getHospitalId()
                            : patientUser.getHospitalId();
                    Hospital hospital = hospitalRepository.findById(hospitalId)
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Hospital not found for deposit " + deposit.getAssetId()));
                    return toDto(deposit, patient, patientUser, hospital);
                })
                .toList();
    }

    @Transactional
    public AssetDepositDto approveRequestByBank(String email, UUID assetId) {
        User bankUser = requireUser(email);
        requireRole(bankUser, Role.RoleType.bank_staff, "Only bank staff can approve bank deposit requests");

        Bank bank = bankRepository.findByEmail(bankUser.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));

        AssetDeposit deposit = assetDepositRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Deposit request not found"));

        assertSameBank(bank, deposit);
        if (!"approved".equalsIgnoreCase(nz(deposit.getStatus()))) {
            throw new IllegalArgumentException("Request must be hospital-approved before bank approval");
        }
        if (!"pending".equalsIgnoreCase(nz(deposit.getBankApprovalStatus()))) {
            throw new IllegalArgumentException("Only forwarded requests can be approved by bank");
        }

        deposit.setBankApprovalStatus("approved");
        deposit.setBankApprovedAt(LocalDateTime.now());
        deposit.setBankRejectedAt(null);
        deposit.setBankRejectionReason(null);

        AssetDeposit saved = assetDepositRepository.save(deposit);
        Patient patient = patientRepository.findById(saved.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        User patientUser = userRepository.findById(patient.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient user not found"));
        UUID hospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : patientUser.getHospitalId();
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        // Bank approval is NOT the minting point. Patient must physically deposit asset first.
        sendNotification(bankUser.getUserId(), patientUser.getUserId(),
            "Deposit Approved by Bank",
            "Your " + saved.getAssetType() + " deposit was approved by the bank. Please visit the bank to physically deposit the asset."
                + " Tokens will be minted after custody is confirmed.");

        // Notify hospital admin about bank approval
        notifyHospitalAdmins(hospitalId, bankUser.getUserId(),
            "Deposit Approved by Bank",
            "Bank approved deposit for patient " + patientUser.getName()
                + " (" + saved.getAssetType() + " worth PKR " + saved.getAssetValue() + ")."
                + " Awaiting physical custody confirmation.");

        return toDto(saved, patient, patientUser, hospital);
    }

        @Transactional
        public AssetDepositDto confirmCustodyAndMint(String email, UUID assetId) {
        User bankUser = requireUser(email);
        requireRole(bankUser, Role.RoleType.bank_staff, "Only bank staff can confirm custody");

        Bank bank = bankRepository.findByEmail(bankUser.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));

        AssetDeposit deposit = assetDepositRepository.findById(assetId)
            .orElseThrow(() -> new IllegalArgumentException("Deposit request not found"));

        assertSameBank(bank, deposit);

        if (!"approved".equalsIgnoreCase(nz(deposit.getStatus()))
            || !"approved".equalsIgnoreCase(nz(deposit.getBankApprovalStatus()))) {
            throw new IllegalArgumentException("Custody can only be confirmed after hospital + bank approval");
        }
        if ("confirmed".equalsIgnoreCase(nz(deposit.getCustodyStatus()))) {
            throw new IllegalArgumentException("Custody already confirmed");
        }

        Patient patient = patientRepository.findById(deposit.getPatientId())
            .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        User patientUser = userRepository.findById(patient.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("Patient user not found"));

        UUID hospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : patientUser.getHospitalId();
        Hospital hospital = hospitalRepository.findById(hospitalId)
            .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        // Mark custody confirmed only — AT minting is now done by hospital admin
        // via /asset-deposits/{id}/mint-tokens (mintTokensForDeposit).
        deposit.setCustodyStatus("confirmed");
        deposit.setCustodyConfirmedAt(LocalDateTime.now());
        deposit.setCustodyConfirmedBy(bankUser.getUserId());
        deposit.setStatus("custody_confirmed");
        deposit.setBaselineHtPerMonth(BigDecimal.ZERO);
        deposit.setLastBaselineHtAt(null);

        AssetDeposit saved = assetDepositRepository.save(deposit);

        sendNotification(bankUser.getUserId(), patientUser.getUserId(),
            "Asset Custody Confirmed — Awaiting Token Mint",
            "The bank confirmed physical custody of your " + saved.getAssetType() + " deposit. "
                + "Hospital admin will mint your AT shortly. "
                + "Monthly baseline HT and profit share start once the hospital moves them into the Trading Pool.");

        notifyHospitalAdmins(hospitalId, bankUser.getUserId(),
            "Custody Confirmed — Mint Required",
            "Patient " + patientUser.getName() + " custody confirmed by bank. "
                + "Mint AT from the Deposits page to make it available in Pool 1.");

        // Ensure an Asset Health Card exists for the patient immediately after custody confirmation
        try {
            creditAssetHealthCard(patient.getId(), BigDecimal.ZERO);
        } catch (Exception e) {
            log.warn("Failed to create asset health card after custody-confirm+mint flow: {}", e.getMessage());
        }

        return toDto(saved, patient, patientUser, hospital);
        }

    /**
     * Hospital admin moves AT from Pool 1 (Available, with patient) to Pool 2 (Trading Pool).
     * Once moved:
     *   - Assignment status flips WITH_PATIENT → AVAILABLE
     *   - AT enters the hospital trading pool entry (HospitalAtPoolEntry)
     *   - Monthly baseline HT starts; first month credited immediately
     *   - AT is now LOCKED — no more emergency redemption against it
     */
    @Transactional
    public AssetDepositDto moveToTradingPool(String email, UUID assetId) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can move AT to the Trading Pool");

        AssetDeposit deposit = assetDepositRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Deposit not found"));

        Patient patient = patientRepository.findById(deposit.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        assertSameHospital(admin, patient);

        if (!"custody_confirmed".equalsIgnoreCase(nz(deposit.getStatus()))) {
            throw new IllegalArgumentException("Custody must be confirmed before moving AT to the Trading Pool");
        }

        UUID hospitalId = admin.getHospitalId();
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));
        User patientUser = userRepository.findById(patient.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient user not found"));

        // Flip the assignment WITH_PATIENT → AVAILABLE
        atTradingService.releaseForTrading(patient.getId(), assetId);

        // Add to the hospital trading pool entry
        BigDecimal mintedAt = nzNum(mintRecordRepository.sumTokensMintedByAssetId(assetId));
        if (mintedAt.compareTo(BigDecimal.ZERO) > 0) {
            hospitalAtPoolService.addToPool(hospitalId, patient.getId(), assetId, mintedAt);
        }

        // Start baseline HT
        BigDecimal baseline = getHospitalBaselineHt(hospital);
        deposit.setBaselineHtPerMonth(baseline);
        if (baseline.compareTo(BigDecimal.ZERO) > 0) {
            creditAssetBaselineHt(patient, baseline, "ASSET_BASELINE_INITIAL", assetId);
        }
        deposit.setLastBaselineHtAt(LocalDateTime.now());
        AssetDeposit saved = assetDepositRepository.save(deposit);

        sendNotification(admin.getUserId(), patientUser.getUserId(),
                "AT Moved to Trading Pool",
                mintedAt.toPlainString() + " of your AT have been moved to the Trading Pool by the hospital. "
                        + "They are now locked for the trading cycle and will earn monthly baseline HT plus a profit share. "
                        + "Emergency Redemption is no longer available for these AT.");

        notifyHospitalAdmins(hospitalId, admin.getUserId(),
                "AT Moved to Pool 2 (Trading)",
                "Patient " + patientUser.getName() + ": "
                        + mintedAt.toPlainString() + " AT moved into Pool 2 (Trading).");

        return toDto(saved, patient, patientUser, hospital);
    }

    /**
     * Hospital admin view of all deposits currently sitting in Pool 1 (Available Pool).
     * Returned rows are eligible for moveToTradingPool.
     */
    @Transactional(readOnly = true)
    public List<AssetDepositDto> getHospitalPool1(String email) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can view Pool 1");

        UUID hospitalId = admin.getHospitalId();
        if (hospitalId == null) {
            throw new IllegalArgumentException("Hospital is not linked to this admin account");
        }

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        return assetDepositRepository.findAllByHospitalId(hospitalId).stream()
                .filter(d -> "custody_confirmed".equalsIgnoreCase(nz(d.getStatus())))
                .filter(d -> {
                    Patient p = patientRepository.findById(d.getPatientId()).orElse(null);
                    if (p == null) return false;
                    return patientAtAssignmentRepository
                            .findByPatientIdAndAssetId(p.getId(), d.getAssetId())
                            .map(a -> a.getAvailabilityStatus() == com.SehatVault.SehatVaultBackend.marketplace.entity.PatientAtAssignment.AvailabilityStatus.WITH_PATIENT)
                            .orElse(Boolean.FALSE);
                })
                .map(d -> {
                    Patient p = patientRepository.findById(d.getPatientId()).orElseThrow();
                    User pu = userRepository.findById(p.getUserId()).orElseThrow();
                    AssetDepositDto dto = toDto(d, p, pu, hospital);
                    // Override expected/current with the live assignment counters so the UI reflects redemptions.
                    BigDecimal currentAt = patientAtAssignmentRepository
                            .findByPatientIdAndAssetId(p.getId(), d.getAssetId())
                            .map(a -> nzNum(a.getTotalAtAssigned()))
                            .orElse(BigDecimal.ZERO);
                    dto.setCurrentPool1At(currentAt);
                    dto.setCurrentPool1ValuePkr(currentAt.multiply(tokenPriceService.getAtPricePkr()));
                    return dto;
                })
                .toList();
    }

    /**
     * Hospital admin view of all assets currently in Pool 2 (Trading Pool).
     * Includes assignments that are released and idle (AVAILABLE) AND those locked in
     * an active trade (UNAVAILABLE). The DTO carries the live AT counts so the UI shows
     * what's currently in the pool, broken down into "released" vs "in trade".
     */
    @Transactional(readOnly = true)
    public List<AssetDepositDto> getHospitalPool2(String email) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can view Pool 2");

        UUID hospitalId = admin.getHospitalId();
        if (hospitalId == null) {
            throw new IllegalArgumentException("Hospital is not linked to this admin account");
        }

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        return assetDepositRepository.findAllByHospitalId(hospitalId).stream()
                .filter(d -> "custody_confirmed".equalsIgnoreCase(nz(d.getStatus())))
                .map(d -> {
                    Patient p = patientRepository.findById(d.getPatientId()).orElse(null);
                    if (p == null) return null;
                    var assignmentOpt = patientAtAssignmentRepository
                            .findByPatientIdAndAssetId(p.getId(), d.getAssetId());
                    if (assignmentOpt.isEmpty()) return null;
                    var assignment = assignmentOpt.get();
                    var status = assignment.getAvailabilityStatus();
                    if (status != com.SehatVault.SehatVaultBackend.marketplace.entity.PatientAtAssignment.AvailabilityStatus.AVAILABLE
                            && status != com.SehatVault.SehatVaultBackend.marketplace.entity.PatientAtAssignment.AvailabilityStatus.UNAVAILABLE) {
                        return null;
                    }
                    User pu = userRepository.findById(p.getUserId()).orElse(null);
                    if (pu == null) return null;
                    AssetDepositDto dto = toDto(d, p, pu, hospital);
                    BigDecimal currentAt = nzNum(assignment.getTotalAtAssigned());
                    dto.setCurrentPool1At(currentAt); // reuse the field as "current AT in pool"
                    dto.setCurrentPool1ValuePkr(currentAt.multiply(tokenPriceService.getAtPricePkr()));
                    return dto;
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Transactional
    public AssetDepositDto rejectRequestByBank(String email, UUID assetId, String reason) {
        User bankUser = requireUser(email);
        requireRole(bankUser, Role.RoleType.bank_staff, "Only bank staff can reject bank deposit requests");

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        Bank bank = bankRepository.findByEmail(bankUser.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));

        AssetDeposit deposit = assetDepositRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Deposit request not found"));

        assertSameBank(bank, deposit);
        if (!"approved".equalsIgnoreCase(nz(deposit.getStatus()))) {
            throw new IllegalArgumentException("Request must be hospital-approved before bank rejection");
        }
        if (!"pending".equalsIgnoreCase(nz(deposit.getBankApprovalStatus()))) {
            throw new IllegalArgumentException("Only forwarded requests can be rejected by bank");
        }

        deposit.setBankApprovalStatus("rejected");
        deposit.setBankRejectedAt(LocalDateTime.now());
        deposit.setBankRejectionReason(reason.trim());
        // Final request outcome becomes rejected if bank rejects.
        deposit.setStatus("rejected");
        deposit.setRejectedAt(LocalDateTime.now());
        deposit.setRejectionReason("Rejected by bank: " + reason.trim());

        AssetDeposit saved = assetDepositRepository.save(deposit);
        Patient patient = patientRepository.findById(saved.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        User patientUser = userRepository.findById(patient.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient user not found"));
        UUID hospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : patientUser.getHospitalId();
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        // Notify patient that deposit was rejected by bank
        sendNotification(bankUser.getUserId(), patientUser.getUserId(),
                "Deposit Rejected by Bank",
                "Your " + saved.getAssetType() + " deposit worth PKR " + saved.getAssetValue()
                        + " was rejected by the bank. Reason: " + reason.trim());

        // Notify hospital admin about bank rejection
        notifyHospitalAdmins(hospitalId, bankUser.getUserId(),
                "Bank Rejected Deposit",
                "Bank rejected deposit for patient " + patientUser.getName()
                        + " (" + saved.getAssetType() + " worth PKR " + saved.getAssetValue()
                        + "). Reason: " + reason.trim());

        return toDto(saved, patient, patientUser, hospital);
    }

    /**
     * Credits monthly baseline HT for custody-confirmed deposits.
     * Uses AssetDeposit.lastBaselineHtAt to ensure idempotency.
     */
    @Transactional
    public int processMonthlyAssetBaselines() {
        List<AssetDeposit> deposits = assetDepositRepository.findByStatusIgnoreCase("custody_confirmed");
        int credits = 0;
        LocalDateTime now = LocalDateTime.now();

        for (AssetDeposit deposit : deposits) {
            BigDecimal baseline = nzNum(deposit.getBaselineHtPerMonth());
            if (baseline.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            LocalDateTime last = deposit.getLastBaselineHtAt();
            if (last == null) {
                // If missing, credit once and set.
                last = deposit.getCustodyConfirmedAt();
            }
            if (last == null) {
                continue;
            }

            long fullMonths = ChronoUnit.MONTHS.between(last.toLocalDate().atStartOfDay(), now.toLocalDate().atStartOfDay());
            if (fullMonths <= 0) {
                continue;
            }

            Patient patient = patientRepository.findById(deposit.getPatientId()).orElse(null);
            if (patient == null) {
                continue;
            }

            for (int i = 0; i < fullMonths; i++) {
                creditAssetBaselineHt(patient, baseline, "ASSET_BASELINE_RECURRING", deposit.getAssetId());
                credits++;
            }

            deposit.setLastBaselineHtAt(now);
            assetDepositRepository.save(deposit);
        }

        return credits;
    }

    private AssetDepositDto toDto(AssetDeposit deposit, Patient patient, User patientUser, Hospital hospital) {
        AssetDepositDto dto = new AssetDepositDto();
        dto.setAssetId(deposit.getAssetId());
        dto.setPatientId(patient.getId());
        dto.setPatientName(patientUser.getName());
        dto.setPatientEmail(patientUser.getEmail());
        dto.setHospitalId(hospital != null ? hospital.getHospitalId() : null);
        dto.setHospitalName(hospital != null ? hospital.getHospitalName() : "Not Assigned");
        dto.setAssetType(deposit.getAssetType());
        dto.setAssetReceipt(deposit.getAssetReceipt());
        dto.setPurityCertificate(deposit.getPurityCertificate());
        dto.setSupportingDocuments(deposit.getSupportingDocuments());
        dto.setWeight(deposit.getWeight());
        dto.setAssetValue(nzNum(deposit.getAssetValue()));
        dto.setExpectedTokens(nzNum(deposit.getAssetValue()).divide(tokenPriceService.getAtPricePkr(), 2, RoundingMode.DOWN));
        dto.setStatus(nz(deposit.getStatus()));
        dto.setBankApprovalStatus(nz(deposit.getBankApprovalStatus()));
        dto.setSubmittedAt(deposit.getSubmittedAt());
        dto.setApprovedAt(deposit.getApprovedAt());
        dto.setRejectedAt(deposit.getRejectedAt());
        dto.setRejectionReason(deposit.getRejectionReason());
        dto.setBankApprovedAt(deposit.getBankApprovedAt());
        dto.setBankRejectedAt(deposit.getBankRejectedAt());
        dto.setBankRejectionReason(deposit.getBankRejectionReason());

        dto.setCustodyStatus(nz(deposit.getCustodyStatus()));
        dto.setCustodyConfirmedAt(deposit.getCustodyConfirmedAt());
        dto.setBaselineHtPerMonth(nzNum(deposit.getBaselineHtPerMonth()));
        dto.setLastBaselineHtAt(deposit.getLastBaselineHtAt());
        dto.setTokensMinted(nzNum(mintRecordRepository.sumTokensMintedByAssetId(deposit.getAssetId())));
        dto.setMinted(Boolean.TRUE.equals(deposit.getMinted()));
        return dto;
    }

       private BankCustodyVerificationDto toCustodyDto(BankCustodyVerification verification, AssetDeposit deposit) {
           BankCustodyVerificationDto dto = new BankCustodyVerificationDto();
           dto.setVerificationId(verification.getVerificationId());
           dto.setDepositId(deposit.getAssetId().toString());
           dto.setVerifiedPurityPercent(verification.getVerifiedPurityPercent());
           dto.setVerifiedWeightGrams(verification.getVerifiedWeightGrams());
           dto.setAssetCondition(verification.getAssetCondition());
           dto.setSerialNumber(verification.getSerialNumber());
           dto.setLoanAmountApprovedPkr(verification.getLoanAmountApprovedPkr());
           dto.setLoanInterestRatePercent(verification.getLoanInterestRatePercent());
           dto.setBankStaffId(verification.getBankStaffId());
           dto.setVerificationNotes(verification.getVerificationNotes());
           dto.setVerifiedAt(verification.getVerifiedAt());
           dto.setCustodyReceivedAt(verification.getCustodyReceivedAt());
           return dto;
       }
    private BigDecimal getHospitalBaselineHt(Hospital hospital) {
        // Minimal policy: default 50 HT/month unless overridden via DB column.
        try {
            // Optional column can be added later; default used if not present in DB.
            Double configured = null;
            try {
                java.lang.reflect.Method getter = hospital.getClass().getMethod("getAssetBaselineHtPerMonth");
                Object val = getter.invoke(hospital);
                if (val instanceof Double d) configured = d;
            } catch (Exception ignored) {
                // Backward compatible: hospital may not yet have this field/column.
            }
            if (configured != null && configured > 0) {
                return BigDecimal.valueOf(configured).setScale(2, RoundingMode.HALF_UP);
            }
        } catch (Exception ignored) {
        }
        return new BigDecimal("50.00");
    }

    private void creditAssetBaselineHt(Patient patient, BigDecimal htCredit, String source, UUID assetId) {
        creditAssetHealthCard(patient.getId(), htCredit);

        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                .orElseGet(() -> {
                    PatientTokenBalance b = new PatientTokenBalance();
                    b.setPatientId(patient.getId());
                    b.setTotalAt(BigDecimal.ZERO);
                    b.setTotalHt(BigDecimal.ZERO);
                    b.setLastUpdated(LocalDateTime.now());
                    return b;
                });
        balance.setTotalHt(nzNum(balance.getTotalHt()).add(nzNum(htCredit)));
        balance.setLastUpdated(LocalDateTime.now());
        patientTokenBalanceRepository.save(balance);

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId != null) {
            BlockchainTxRef chainTx = tokenContractGateway.mintHT(
                    patient.getWalletAddress(),
                    TokenUnitConverter.toBaseUnits(nzNum(htCredit), 18)
            );

            Transaction tx = new Transaction();
            tx.setUserId(patient.getUserId());
            tx.setTokenId(htTokenId);
            tx.setType(Transaction.TransactionType.CREDIT);
            tx.setAmount(nzNum(htCredit));
            tx.setDescription("Asset baseline HT credit (" + source + ") for asset " + assetId);
            tx.setSenderWalletAddress("ASSET_BASELINE_SYSTEM");
            tx.setReceiverWalletAddress(patient.getWalletAddress());
            tx.setTransactionHash(chainTx.getTransactionHash());
            tx.setBlockNumber(chainTx.getBlockNumber());
            tx.setStatus("CONFIRMED");
            tx.setTimestamp(LocalDateTime.now());
            walletTransactionRepository.save(tx);
        }

        ActivityLog activity = new ActivityLog();
        activity.setUserId(patient.getUserId());
        activity.setActivityName("Asset Monthly HT Baseline");
        activity.setDescription(htCredit.toPlainString() + " HT credited to Asset Health Card (asset " + assetId + ")");
        activity.setType(ActivityLog.ActivityType.ACTION);
        activity.setStatus("SUCCESS");
        activity.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(activity);
    }

    private String normalizeAssetType(String input) {
        String value = input.trim().toUpperCase(Locale.ROOT);
        return switch (value) {
            case "GOLD", "SILVER", "CASH", "PROPERTY" -> value;
            default -> throw new IllegalArgumentException("assetType must be one of GOLD, SILVER, CASH, PROPERTY");
        };
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void requireRole(User user, Role.RoleType roleType, String message) {
        if (user.getRole() == null || user.getRole().getRoleName() != roleType) {
            throw new IllegalArgumentException(message);
        }
    }

    private void assertSameHospital(User admin, Patient patient) {
        if (admin.getHospitalId() == null) {
            throw new IllegalArgumentException("Hospital is not linked to this admin account");
        }
        if (patient.getHospitalId() == null || !admin.getHospitalId().equals(patient.getHospitalId())) {
            throw new IllegalArgumentException("Deposit request does not belong to this hospital");
        }
    }

    private void assertSameBank(Bank bank, AssetDeposit deposit) {
        if (deposit.getBankId() == null || !deposit.getBankId().equals(bank.getBankId())) {
            throw new IllegalArgumentException("Deposit request does not belong to this bank");
        }
    }

    private BigDecimal nzNum(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String nz(String value) {
        return value == null ? "" : value;
    }

    private void validateMintCap(AssetDeposit deposit, BigDecimal newAtMintAmount) {
        BigDecimal maxMintableAt = nzNum(deposit.getAssetValue()).divide(tokenPriceService.getAtPricePkr(), 8, RoundingMode.DOWN);
        BigDecimal alreadyMintedAt = nzNum(mintRecordRepository.sumTokensMintedByAssetId(deposit.getAssetId()));
        BigDecimal cumulativeAt = alreadyMintedAt.add(nzNum(newAtMintAmount));

        if (cumulativeAt.compareTo(maxMintableAt) > 0) {
            throw new IllegalArgumentException(
                    "Over-tokenization blocked for asset " + deposit.getAssetId()
                            + ". maxMintableAT=" + maxMintableAt.toPlainString()
                            + ", alreadyMintedAT=" + alreadyMintedAt.toPlainString()
                            + ", requestedAT=" + newAtMintAmount.toPlainString());
        }
    }

    private void recordMint(
            AssetDeposit deposit,
            UUID patientId,
            UUID minterId,
            BigDecimal atTokens,
            Object unused) {
            Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found for mint record"));

            String metadata = "{"
                + "\"assetId\":\"" + deposit.getAssetId() + "\""
                + ",\"assetType\":\"" + nz(deposit.getAssetType()) + "\""
                + ",\"assetValuePkr\":\"" + nzNum(deposit.getAssetValue()).toPlainString() + "\""
                + "}";

            log.info("Minting AT on-chain — asset={}, patientWallet={}, atTokens={}",
                    deposit.getAssetId(), patient.getWalletAddress(), atTokens);

            BlockchainTxRef chainTx = tokenContractGateway.mintATViaHospitalFinancials(
                patient.getWalletAddress(),
                UuidUint256.toUint256(deposit.getAssetId()),
                TokenUnitConverter.toBaseUnits(nzNum(atTokens), 18),
                metadata
            );

            log.info("On-chain AT mint succeeded — asset={}, tx={}, block={}",
                    deposit.getAssetId(), chainTx.getTransactionHash(), chainTx.getBlockNumber());

        MintRecord mintRecord = new MintRecord();
        mintRecord.setAssetId(deposit.getAssetId());
        mintRecord.setPatientId(patientId);
        mintRecord.setMinterId(minterId);
        mintRecord.setTokensMinted(atTokens);
        mintRecord.setAmount(atTokens.multiply(tokenPriceService.getAtPricePkr()));
        mintRecord.setStatus("CONFIRMED");
            mintRecord.setTransactionHash(chainTx.getTransactionHash());
            mintRecord.setBlockNumber(chainTx.getBlockNumber());
        mintRecord.setTimestamp(LocalDateTime.now());
        mintRecordRepository.save(mintRecord);
    }

    private void creditAssetHealthCard(UUID patientId, BigDecimal htCredit) {
        try {
            Card card = cardRepository.findByCardNameIgnoreCase("Asset Health Card").orElseGet(() -> {
                Card c = new Card();
                c.setCardName("Asset Health Card");
                return cardRepository.save(c);
            });
            List<HealthCard> cards = healthCardRepository.findByPatientIdAndCardId(patientId, card.getCardId());
            HealthCard hc;
            if (cards.isEmpty()) {
                hc = new HealthCard();
                hc.setPatientId(patientId);
                hc.setCardId(card.getCardId());
                hc.setCardNum(generateCardNum());
                hc.setHtBalance(BigDecimal.ZERO);
                hc.setExpiryDate(LocalDate.now().plusYears(3));
                hc.setCvv(String.format("%03d", new Random().nextInt(1000)));
            } else {
                hc = cards.get(0);
            }
            hc.setHtBalance(nzNum(hc.getHtBalance()).add(nzNum(htCredit)));
            healthCardRepository.save(hc);
        } catch (Exception e) {
            System.err.println("[WARN] Could not credit asset health card: " + e.getMessage());
        }
    }

    private String generateCardNum() {
        Random rng = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            if (i > 0 && i % 4 == 0)
                sb.append('-');
            sb.append(rng.nextInt(10));
        }
        String num = sb.toString();
        return healthCardRepository.existsByCardNum(num) ? generateCardNum() : num;
    }

    private void sendNotification(UUID senderId, UUID receiverId, String title, String message) {
        try {
            notificationService.notifyUser(senderId, receiverId, title, message);
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
        }
    }

    private void notifyHospitalAdmins(UUID hospitalId, UUID senderId, String title, String message) {
        try {
            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() != null && u.getRole().getRoleName() == Role.RoleType.hospital_admin)
                    .filter(u -> hospitalId.equals(u.getHospitalId()))
                    .toList();
            for (User admin : admins) {
                sendNotification(senderId, admin.getUserId(), title, message);
            }
        } catch (Exception e) {
            log.warn("Failed to notify hospital admins: {}", e.getMessage());
        }
    }

    private void notifyBankStaff(UUID bankId, UUID senderId, String title, String message) {
        try {
            Bank bank = bankRepository.findById(bankId).orElse(null);
            if (bank != null && bank.getEmail() != null) {
                userRepository.findByEmail(bank.getEmail()).ifPresent(bankUser ->
                        sendNotification(senderId, bankUser.getUserId(), title, message));
            }
        } catch (Exception e) {
            log.warn("Failed to notify bank staff: {}", e.getMessage());
        }
    }
}
