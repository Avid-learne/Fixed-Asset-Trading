package com.SehatVault.SehatVaultBackend.wallet.service;

import com.SehatVault.SehatVaultBackend.notification.entity.Notification;
import com.SehatVault.SehatVaultBackend.notification.repository.NotificationRepository;
import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.wallet.dto.DeductHtRequest;
import com.SehatVault.SehatVaultBackend.wallet.dto.WalletSummaryDto;
import com.SehatVault.SehatVaultBackend.wallet.dto.WalletTransactionDto;
import com.SehatVault.SehatVaultBackend.wallet.dto.TransferHtRequest;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.blockchain.model.BlockchainTxRef;
import com.SehatVault.SehatVaultBackend.blockchain.service.BlockchainWriteService;
import com.SehatVault.SehatVaultBackend.blockchain.service.TokenContractGateway;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final PatientRepository patientRepository;
        private final UserRepository userRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final NotificationRepository notificationRepository;
    private final WalletTransactionRepository walletTransactionRepository;
        private final ActivityLogRepository activityLogRepository;
        private final CardRepository cardRepository;
        private final HealthCardRepository healthCardRepository;
        private final BlockchainWriteService blockchainWriteService;
        private final TokenContractGateway tokenContractGateway;

    public WalletSummaryDto getWalletSummary(UUID userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found for this user"));

        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                .orElse(null);

        return new WalletSummaryDto(
                userId.toString(),
                patient.getId().toString(),
                patient.getWalletAddress(),
                balance != null && balance.getTotalAt() != null ? balance.getTotalAt() : BigDecimal.ZERO,
                balance != null && balance.getTotalHt() != null ? balance.getTotalHt() : BigDecimal.ZERO
        );
    }

    public List<WalletTransactionDto> getWalletTransactions(UUID userId) {
        return walletTransactionRepository.findRecentByUserId(userId)
                .stream()
                .map(this::mapRow)
                .collect(Collectors.toList());
    }

    public List<WalletTransactionDto> getWalletTransactionsByToken(UUID userId, String tokenSymbol) {
        return walletTransactionRepository.findRecentByUserIdAndTokenSymbol(userId, tokenSymbol)
                .stream()
                .map(this::mapRow)
                .collect(Collectors.toList());
    }

        @Transactional
        public void transferHealthTokens(String senderEmail, TransferHtRequest request) {
                if (request.getRecipientWalletAddress() == null || request.getRecipientWalletAddress().isBlank()) {
                        throw new IllegalArgumentException("Recipient wallet address is required");
                }
                if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Transfer amount must be greater than zero");
                }

                User senderUser = userRepository.findByEmail(senderEmail)
                                .orElseThrow(() -> new IllegalArgumentException("Sender account not found"));

                Patient senderPatient = patientRepository.findByUserId(senderUser.getUserId())
                                .orElseThrow(() -> new IllegalArgumentException("Sender patient profile not found"));
                if (senderPatient.getWalletAddress() == null || senderPatient.getWalletAddress().isBlank()) {
                        throw new IllegalArgumentException("Please set your wallet address in profile before transferring HT");
                }

                Patient recipientPatient = patientRepository.findByWalletAddressIgnoreCase(request.getRecipientWalletAddress().trim())
                                .orElseThrow(() -> new IllegalArgumentException("Recipient wallet was not found"));

                if (recipientPatient.getId().equals(senderPatient.getId())) {
                        throw new IllegalArgumentException("Cannot transfer HT to your own wallet");
                }

                PatientTokenBalance senderBalance = patientTokenBalanceRepository.findByPatientId(senderPatient.getId())
                                .orElseThrow(() -> new IllegalArgumentException("Sender wallet balance not found"));

                BigDecimal senderHt = nz(senderBalance.getTotalHt());
                if (senderHt.compareTo(request.getAmount()) < 0) {
                        throw new IllegalArgumentException("Insufficient HT balance");
                }

                PatientTokenBalance recipientBalance = patientTokenBalanceRepository.findByPatientId(recipientPatient.getId())
                                .orElseGet(() -> {
                                        PatientTokenBalance b = new PatientTokenBalance();
                                        b.setPatientId(recipientPatient.getId());
                                        b.setTotalAt(BigDecimal.ZERO);
                                        b.setTotalHt(BigDecimal.ZERO);
                                        b.setLastUpdated(LocalDateTime.now());
                                        return b;
                                });

                senderBalance.setTotalHt(senderHt.subtract(request.getAmount()));
                senderBalance.setLastUpdated(LocalDateTime.now());
                recipientBalance.setTotalHt(nz(recipientBalance.getTotalHt()).add(request.getAmount()));
                recipientBalance.setLastUpdated(LocalDateTime.now());

                patientTokenBalanceRepository.save(senderBalance);
                patientTokenBalanceRepository.save(recipientBalance);

                UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
                if (htTokenId == null) {
                        throw new IllegalArgumentException("HT token is not configured in tokens table");
                }

                String providedHash = request.getTransactionHash() != null ? request.getTransactionHash().trim() : null;
                String debitHash = (providedHash != null && !providedHash.isBlank())
                        ? providedHash
                        : "0x" + String.format("%064x", System.currentTimeMillis());
                String creditHash = debitHash;

                Long blockNumber = null;
                if (providedHash != null && !providedHash.isBlank()) {
                        blockNumber = blockchainWriteService.getReceipt(providedHash)
                                .flatMap(r -> r.getBlockNumber() != null ? java.util.Optional.of(r.getBlockNumber().longValue()) : java.util.Optional.empty())
                                .orElse(null);
                }

                String note = request.getNote() == null || request.getNote().isBlank() ? "HT transfer" : request.getNote().trim();

                Transaction debit = new Transaction();
                debit.setUserId(senderUser.getUserId());
                debit.setTokenId(htTokenId);
                debit.setType(Transaction.TransactionType.DEBIT);
                debit.setAmount(request.getAmount());
                debit.setDescription(note);
                debit.setSenderWalletAddress(senderPatient.getWalletAddress());
                debit.setReceiverWalletAddress(recipientPatient.getWalletAddress());
                debit.setTransactionHash(debitHash);
                debit.setBlockNumber(blockNumber);
                debit.setStatus("PENDING");
                debit.setTimestamp(LocalDateTime.now());
                walletTransactionRepository.save(debit);

                Transaction credit = new Transaction();
                credit.setUserId(recipientPatient.getUserId());
                credit.setTokenId(htTokenId);
                credit.setType(Transaction.TransactionType.CREDIT);
                credit.setAmount(request.getAmount());
                credit.setDescription(note);
                credit.setSenderWalletAddress(senderPatient.getWalletAddress());
                credit.setReceiverWalletAddress(recipientPatient.getWalletAddress());
                credit.setTransactionHash(creditHash);
                credit.setBlockNumber(blockNumber);
                credit.setStatus("PENDING");
                credit.setTimestamp(LocalDateTime.now());
                walletTransactionRepository.save(credit);

                // Send notification to recipient
                Notification notification = new Notification();
                notification.setSenderId(senderUser.getUserId());
                notification.setReceiverId(recipientPatient.getUserId());
                String senderName = senderPatient.getId().toString().substring(0, Math.min(12, senderPatient.getId().toString().length()));
                notification.setNotificationText("HT Transfer Received::You received " + request.getAmount() + " HT from patient " + senderName);
                notification.setStatus(Notification.NotificationStatus.UNREAD);
                notification.setTimestamp(LocalDateTime.now());
                notificationRepository.save(notification);
        }

        @Transactional
        public void redeemPatientHealthTokens(String staffEmail, DeductHtRequest request) {
                if (request.getPatientUserId() == null) {
                        throw new IllegalArgumentException("Patient user ID is required");
                }
                if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Deduction amount must be greater than zero");
                }

                User staffUser = userRepository.findByEmail(staffEmail)
                                .orElseThrow(() -> new IllegalArgumentException("Staff account not found"));

                Role.RoleType role = staffUser.getRole() != null ? staffUser.getRole().getRoleName() : null;
                if (role != Role.RoleType.hospital_staff && role != Role.RoleType.hospital_admin) {
                        throw new IllegalArgumentException("Only hospital staff/admin can redeem patient HT");
                }

                Patient patient = patientRepository.findByUserId(request.getPatientUserId())
                                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

                if (staffUser.getHospitalId() == null || patient.getHospitalId() == null
                                || !staffUser.getHospitalId().equals(patient.getHospitalId())) {
                        throw new IllegalArgumentException("You can only redeem HT for patients in your hospital");
                }

                PatientTokenBalance patientBalance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                                .orElseThrow(() -> new IllegalArgumentException("Patient wallet balance not found"));

                BigDecimal currentHt = nz(patientBalance.getTotalHt());
                if (currentHt.compareTo(request.getAmount()) < 0) {
                        throw new IllegalArgumentException("Insufficient HT balance for redemption");
                }

                String deductedFrom = deductFromHealthCards(patient.getId(), request.getAmount(), request.getSource());

                patientBalance.setTotalHt(currentHt.subtract(request.getAmount()));
                patientBalance.setLastUpdated(LocalDateTime.now());
                patientTokenBalanceRepository.save(patientBalance);

                UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
                if (htTokenId == null) {
                        throw new IllegalArgumentException("HT token is not configured in tokens table");
                }

                String reason = request.getReason() == null || request.getReason().isBlank()
                                ? "Hospital HT redemption"
                                : request.getReason().trim();

                Transaction debit = new Transaction();
                debit.setUserId(patient.getUserId());
                debit.setTokenId(htTokenId);
                debit.setType(Transaction.TransactionType.DEBIT);
                debit.setAmount(request.getAmount());
                debit.setDescription("Hospital redemption: " + reason + " (processed by " + staffUser.getEmail() + ")");
                debit.setSenderWalletAddress(patient.getWalletAddress());
                debit.setReceiverWalletAddress("HOSPITAL_REDEMPTION");
                BlockchainTxRef chainTx = tokenContractGateway.redeemHTViaHospitalFinancials(
                        patient.getWalletAddress(),
                        com.SehatVault.SehatVaultBackend.blockchain.util.TokenUnitConverter.toBaseUnits(nz(request.getAmount()), 18),
                        reason
                );
                debit.setTransactionHash(chainTx.getTransactionHash());
                debit.setBlockNumber(chainTx.getBlockNumber());
                debit.setStatus("PENDING");
                debit.setTimestamp(LocalDateTime.now());
                walletTransactionRepository.save(debit);

                ActivityLog patientActivity = new ActivityLog();
                patientActivity.setUserId(patient.getUserId());
                patientActivity.setActivityName("HT Redemption");
                patientActivity.setDescription(String.format("%s HT redeemed from %s for service: %s", request.getAmount(), deductedFrom, reason));
                patientActivity.setType(ActivityLog.ActivityType.ACTION);
                patientActivity.setStatus("SUCCESS");
                patientActivity.setTimestamp(LocalDateTime.now());
                activityLogRepository.save(patientActivity);

                ActivityLog staffActivity = new ActivityLog();
                staffActivity.setUserId(staffUser.getUserId());
                staffActivity.setActivityName("Patient HT Redemption");
                staffActivity.setDescription(String.format("Redeemed %s HT from patient %s (%s)",
                                request.getAmount(), patient.getId(), patient.getUserId()));
                staffActivity.setType(ActivityLog.ActivityType.ACTION);
                staffActivity.setStatus("SUCCESS");
                staffActivity.setTimestamp(LocalDateTime.now());
                activityLogRepository.save(staffActivity);
        }

        private String deductFromHealthCards(UUID patientId, BigDecimal amount, String source) {
                if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Deduction amount must be greater than zero");
                }

                if (source != null && !source.isBlank()) {
                        String normalized = source.trim().toUpperCase();
                        String cardName = "ASSET".equals(normalized) ? "Asset Health Card" : "Subscription Card";
                        deductFromHealthCardRequired(patientId, cardName, amount);
                        return cardName;
                }

                // Auto-pick bucket based on where HT actually exists.
                HealthCard subscription = getPatientHealthCardOrNull(patientId, "Subscription Card");
                HealthCard asset = getPatientHealthCardOrNull(patientId, "Asset Health Card");

                BigDecimal subBal = subscription != null ? nz(subscription.getHtBalance()) : BigDecimal.ZERO;
                BigDecimal assetBal = asset != null ? nz(asset.getHtBalance()) : BigDecimal.ZERO;

                if (subBal.compareTo(amount) >= 0) {
                        subscription.setHtBalance(subBal.subtract(amount));
                        healthCardRepository.save(subscription);
                        return "Subscription Card";
                }

                if (assetBal.compareTo(amount) >= 0) {
                        asset.setHtBalance(assetBal.subtract(amount));
                        healthCardRepository.save(asset);
                        return "Asset Health Card";
                }

                BigDecimal combined = subBal.add(assetBal);
                if (combined.compareTo(amount) >= 0) {
                        BigDecimal remaining = amount;

                        if (subscription != null && subBal.compareTo(BigDecimal.ZERO) > 0) {
                                BigDecimal fromSub = subBal.min(remaining);
                                subscription.setHtBalance(subBal.subtract(fromSub));
                                healthCardRepository.save(subscription);
                                remaining = remaining.subtract(fromSub);
                        }

                        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                                if (asset == null) {
                                        throw new IllegalArgumentException("Asset Health Card not found for patient");
                                }
                                asset.setHtBalance(assetBal.subtract(remaining));
                                healthCardRepository.save(asset);
                        }

                        return "Subscription Card + Asset Health Card";
                }

                if (subscription == null && asset == null) {
                        // Do not block redemption if card rows are missing but wallet HT exists.
                        return "Wallet";
                }

                throw new IllegalArgumentException("Insufficient HT balance in Subscription/Asset cards");
        }

        private void deductFromHealthCardRequired(UUID patientId, String cardName, BigDecimal amount) {
                HealthCard hc = getPatientHealthCardOrNull(patientId, cardName);
                if (hc == null) {
                        throw new IllegalArgumentException(cardName + " not found for patient");
                }

                BigDecimal current = nz(hc.getHtBalance());
                if (current.compareTo(amount) < 0) {
                        throw new IllegalArgumentException("Insufficient HT balance in " + cardName);
                }
                hc.setHtBalance(current.subtract(amount));
                healthCardRepository.save(hc);
        }

        private HealthCard getPatientHealthCardOrNull(UUID patientId, String cardName) {
                Card card = cardRepository.findByCardNameIgnoreCase(cardName)
                                .orElseThrow(() -> new IllegalArgumentException("Card not configured: " + cardName));

                return healthCardRepository.findByPatientIdAndCardId(patientId, card.getCardId())
                                .stream()
                                .findFirst()
                                .orElse(null);
        }

    private WalletTransactionDto mapRow(WalletTransactionRepository.WalletTransactionRow row) {
        return new WalletTransactionDto(
                row.getTransactionId() != null ? row.getTransactionId().toString() : null,
                row.getTokenSymbol(),
                row.getTransactionType(),
                row.getAmount(),
                row.getDescription(),
                row.getSenderWalletAddress(),
                row.getReceiverWalletAddress(),
                row.getBlockNumber(),
                row.getTransactionHash(),
                row.getStatus(),
                row.getTimestamp() != null ? row.getTimestamp().toString() : null
        );
    }

        private BigDecimal nz(BigDecimal value) {
                return value == null ? BigDecimal.ZERO : value;
        }
}
