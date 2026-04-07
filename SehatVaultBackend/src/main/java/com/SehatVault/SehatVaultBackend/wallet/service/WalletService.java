package com.SehatVault.SehatVaultBackend.wallet.service;

import com.SehatVault.SehatVaultBackend.notification.entity.Notification;
import com.SehatVault.SehatVaultBackend.notification.repository.NotificationRepository;
import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.wallet.dto.WalletSummaryDto;
import com.SehatVault.SehatVaultBackend.wallet.dto.WalletTransactionDto;
import com.SehatVault.SehatVaultBackend.wallet.dto.TransferHtRequest;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
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

                String baseHash = UUID.randomUUID().toString().replace("-", "");
                String debitHash = baseHash + "00";
                String creditHash = baseHash + "01";
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
                debit.setStatus("SUCCESS");
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
                credit.setStatus("SUCCESS");
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
