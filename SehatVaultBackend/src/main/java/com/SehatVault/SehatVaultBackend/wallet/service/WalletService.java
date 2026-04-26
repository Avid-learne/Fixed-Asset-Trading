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

                String debitHash = "0x" + String.format("%064x", System.currentTimeMillis());
                String creditHash = "0x" + String.format("%064x", System.currentTimeMillis() + 1);

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

                // Enforce source bucket balance (Subscription Card vs Asset Health Card)
                String source = request.getSource() == null ? "SUBSCRIPTION" : request.getSource().trim().toUpperCase();
                String cardName = "SUBSCRIPTION".equals(source) ? "Subscription Card" : "Asset Health Card";
                deductFromHealthCard(patient.getId(), cardName, request.getAmount());

                BigDecimal currentHt = nz(patientBalance.getTotalHt());
                if (currentHt.compareTo(request.getAmount()) < 0) {
                        throw new IllegalArgumentException("Insufficient HT balance for redemption");
                }

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
                debit.setTransactionHash("0x" + String.format("%064x", System.currentTimeMillis()));
                debit.setStatus("PENDING");
                debit.setTimestamp(LocalDateTime.now());
                walletTransactionRepository.save(debit);

                ActivityLog patientActivity = new ActivityLog();
                patientActivity.setUserId(patient.getUserId());
                patientActivity.setActivityName("HT Redemption");
                patientActivity.setDescription(String.format("%s HT redeemed from %s for service: %s", request.getAmount(), cardName, reason));
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

        private void deductFromHealthCard(UUID patientId, String cardName, BigDecimal amount) {
                if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Deduction amount must be greater than zero");
                }

                Card card = cardRepository.findByCardNameIgnoreCase(cardName)
                                .orElseThrow(() -> new IllegalArgumentException(cardName + " not found for patient"));

                HealthCard hc = healthCardRepository.findByPatientIdAndCardId(patientId, card.getCardId())
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new IllegalArgumentException(cardName + " not found for patient"));

                BigDecimal current = hc.getHtBalance() == null ? BigDecimal.ZERO : hc.getHtBalance();
                if (current.compareTo(amount) < 0) {
                        throw new IllegalArgumentException("Insufficient HT balance in " + cardName);
                }
                hc.setHtBalance(current.subtract(amount));
                healthCardRepository.save(hc);
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
