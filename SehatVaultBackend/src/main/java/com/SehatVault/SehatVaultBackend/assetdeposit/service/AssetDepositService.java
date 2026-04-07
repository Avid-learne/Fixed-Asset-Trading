package com.SehatVault.SehatVaultBackend.assetdeposit.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.dto.AssetDepositDto;
import com.SehatVault.SehatVaultBackend.assetdeposit.dto.HospitalOptionDto;
import com.SehatVault.SehatVaultBackend.assetdeposit.dto.SubmitAssetDepositRequest;
import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.entity.MintRecord;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.MintRecordRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.bank.entity.Bank;
import com.SehatVault.SehatVaultBackend.bank.repository.BankRepository;
import com.SehatVault.SehatVaultBackend.blockchain.dto.BlockchainMintRequest;
import com.SehatVault.SehatVaultBackend.blockchain.dto.BlockchainMintResponse;
import com.SehatVault.SehatVaultBackend.blockchain.service.BlockchainService;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import com.SehatVault.SehatVaultBackend.marketplace.service.AtTradingService;
import com.SehatVault.SehatVaultBackend.marketplace.service.HospitalAtPoolService;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.notification.entity.Notification;
import com.SehatVault.SehatVaultBackend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetDepositService {

    private static final BigDecimal TOKEN_RATIO = new BigDecimal("100");

    private final AssetDepositRepository assetDepositRepository;
    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final HealthCardRepository healthCardRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final BankRepository bankRepository;
    private final MintRecordRepository mintRecordRepository;
    private final HospitalAtPoolService hospitalAtPoolService;
    private final BlockchainService blockchainService;
    private final AtTradingService atTradingService;
    private final NotificationRepository notificationRepository;

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

        User user = requireUser(email);
        requireRole(user, Role.RoleType.patient, "Only patients can submit deposit requests");

        Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

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

        UUID bankId = assetDepositRepository.findAnyBankId();
        if (bankId == null) {
            throw new IllegalArgumentException(
                    "No bank is configured yet. Create at least one bank before submitting deposit requests.");
        }

        AssetDeposit deposit = new AssetDeposit();
        deposit.setPatientId(patient.getId());
        deposit.setBankId(bankId);
        deposit.setAssetType(normalizeAssetType(request.getAssetType()));
        deposit.setAssetValue(request.getAssetValue());
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
    public AssetDepositDto approveRequest(String email, UUID assetId) {
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

        deposit.setStatus("approved");
        deposit.setApprovedAt(LocalDateTime.now());
        deposit.setRejectedAt(null);
        deposit.setRejectionReason(null);
        // Hospital approval forwards request to bank queue.
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

        // Notify bank staff about new deposit for approval
        notifyBankStaff(saved.getBankId(), admin.getUserId(),
                "New Deposit for Bank Approval",
                "A " + saved.getAssetType() + " deposit worth PKR " + saved.getAssetValue()
                        + " from patient " + patientUser.getName() + " needs bank approval.");

        return toDto(saved, patient, patientUser, hospital);
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

        // Mint AT and HT from approved asset value.
        BigDecimal atTokens = nzNum(saved.getAssetValue()).divide(TOKEN_RATIO, 2, RoundingMode.DOWN);
        BigDecimal htTokens = atTokens;

        validateMintCap(saved, atTokens);

        String patientWalletAddress = nz(patient.getWalletAddress()).trim();
        if (patientWalletAddress.isBlank()) {
            throw new IllegalArgumentException(
                    "Patient wallet address is missing. Please update patient wallet before minting.");
        }

        // Submit AT mint on-chain first so DB 'minted' status always has a real
        // blockchain tx hash.
        BlockchainMintResponse mintResponse = blockchainService.mintAssetToken(
                BlockchainMintRequest.builder()
                        .patientAddress(patientWalletAddress)
                        .amount(atTokens.toBigInteger())
                        .tokenType("AT")
                        .depositId(saved.getAssetId().getMostSignificantBits())
                        .metadata("asset-id:" + saved.getAssetId())
                        .build());

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
        balance.setTotalHt(nzNum(balance.getTotalHt()).add(htTokens));
        balance.setLastUpdated(LocalDateTime.now());
        patientTokenBalanceRepository.save(balance);

        recordMint(saved, patient.getId(), bankUser.getUserId(), atTokens, mintResponse);
        hospitalAtPoolService.addToPool(hospitalId, patient.getId(), saved.getAssetId(), atTokens);

        // Initialize AT assignment for AT Trading System
        atTradingService.initializeAtAssignment(patient.getId(), saved.getAssetId(), hospitalId, atTokens);
        log.info("AT assignment initialized for patient {} with {} AT from approved asset {}",
                patient.getId(), atTokens, saved.getAssetId());

        // Auto-create/update Asset Health Card and move approved HT into the card
        // balance.
        creditAssetHealthCard(patient.getId(), htTokens);

        // Notify patient that tokens were minted
        sendNotification(bankUser.getUserId(), patientUser.getUserId(),
                "Asset Tokens Minted",
                "Your " + saved.getAssetType() + " deposit has been approved by the bank. "
                        + atTokens + " AT and " + htTokens + " HT tokens have been minted to your wallet.");

        // Notify hospital admin about successful minting
        notifyHospitalAdmins(hospitalId, bankUser.getUserId(),
                "Deposit Approved & Tokens Minted",
                "Bank approved deposit for patient " + patientUser.getName()
                        + ". " + atTokens + " AT minted from " + saved.getAssetType()
                        + " worth PKR " + saved.getAssetValue() + ".");

        return toDto(saved, patient, patientUser, hospital);
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

    private AssetDepositDto toDto(AssetDeposit deposit, Patient patient, User patientUser, Hospital hospital) {
        AssetDepositDto dto = new AssetDepositDto();
        dto.setAssetId(deposit.getAssetId());
        dto.setPatientId(patient.getId());
        dto.setPatientName(patientUser.getName());
        dto.setPatientEmail(patientUser.getEmail());
        dto.setHospitalId(hospital != null ? hospital.getHospitalId() : null);
        dto.setHospitalName(hospital != null ? hospital.getHospitalName() : "Not Assigned");
        dto.setAssetType(deposit.getAssetType());
        dto.setWeight(deposit.getWeight());
        dto.setAssetValue(nzNum(deposit.getAssetValue()));
        dto.setExpectedTokens(nzNum(deposit.getAssetValue()).divide(TOKEN_RATIO, 2, RoundingMode.DOWN));
        dto.setStatus(nz(deposit.getStatus()));
        dto.setBankApprovalStatus(nz(deposit.getBankApprovalStatus()));
        dto.setSubmittedAt(deposit.getSubmittedAt());
        dto.setApprovedAt(deposit.getApprovedAt());
        dto.setRejectedAt(deposit.getRejectedAt());
        dto.setRejectionReason(deposit.getRejectionReason());
        dto.setBankApprovedAt(deposit.getBankApprovedAt());
        dto.setBankRejectedAt(deposit.getBankRejectedAt());
        dto.setBankRejectionReason(deposit.getBankRejectionReason());
        return dto;
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
        BigDecimal maxMintableAt = nzNum(deposit.getAssetValue()).divide(TOKEN_RATIO, 8, RoundingMode.DOWN);
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
            BlockchainMintResponse mintResponse) {
        MintRecord mintRecord = new MintRecord();
        mintRecord.setAssetId(deposit.getAssetId());
        mintRecord.setPatientId(patientId);
        mintRecord.setMinterId(minterId);
        mintRecord.setTokensMinted(atTokens);
        mintRecord.setAmount(atTokens.multiply(TOKEN_RATIO));
        mintRecord.setStatus("PENDING");
        if (mintResponse != null) {
            mintRecord.setTransactionHash(mintResponse.getTransactionHash());
            if (mintResponse.getBlockNumber() != null && !mintResponse.getBlockNumber().isBlank()) {
                try {
                    mintRecord.setBlockNumber(Long.parseLong(mintResponse.getBlockNumber()));
                } catch (NumberFormatException ignored) {
                    mintRecord.setBlockNumber(null);
                }
            }
        }
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
            Notification notification = new Notification();
            notification.setSenderId(senderId);
            notification.setReceiverId(receiverId);
            notification.setNotificationText(title + "::" + message);
            notification.setStatus(Notification.NotificationStatus.UNREAD);
            notification.setTimestamp(LocalDateTime.now());
            notificationRepository.save(notification);
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
