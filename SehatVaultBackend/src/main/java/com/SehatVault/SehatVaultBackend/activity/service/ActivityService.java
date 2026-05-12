package com.SehatVault.SehatVaultBackend.activity.service;

import com.SehatVault.SehatVaultBackend.activity.dto.ActivityLogDto;
import com.SehatVault.SehatVaultBackend.activity.dto.ActivityTransactionDto;
import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.activity.repository.TransactionRepository;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final TransactionRepository transactionRepository;
    private final ActivityLogRepository activityLogRepository;
        private final UserRepository userRepository;
        private final PatientRepository patientRepository;

    public List<ActivityTransactionDto> getPatientTransactions(UUID userId) {
        return transactionRepository.findRecentActivityByUserId(userId)
                .stream()
                .map(row -> {
                    String normalizedStatus = row.getStatus() == null
                            ? "pending"
                            : row.getStatus().toLowerCase(Locale.ROOT);

                    return new ActivityTransactionDto(
                            row.getTransactionId().toString(),
                            row.getTokenSymbol(),
                            row.getTimestamp() != null ? row.getTimestamp().toString() : null,
                            normalizedStatus,
                            row.getAmount(),
                            row.getTransactionHash(),
                            row.getSenderWalletAddress(),
                            row.getReceiverWalletAddress(),
                            resolveName(row.getReceiverWalletAddress(), row.getDescription()),
                            row.getDescription(),
                            row.getTransactionType(),
                            row.getBlockNumber()
                    );
                })
                .collect(Collectors.toList());
    }

    private String resolveName(String walletAddress, String fallback) {
        if (walletAddress == null || walletAddress.isBlank()) {
            return fallback;
        }

        String normalized = walletAddress.trim();
        if (normalized.equalsIgnoreCase("HOSPITAL_REDEMPTION")) return "Hospital Redemption";
        if (normalized.equalsIgnoreCase("FRACTIONALIZATION_POOL")) return "Fractionalization Pool";
        if (normalized.equalsIgnoreCase("FRACTIONAL_ALLOCATION")) return "Fractional Allocation";
        if (normalized.equalsIgnoreCase("SUBSCRIPTION_SYSTEM")) return "Subscription System";
        if (normalized.equalsIgnoreCase("ASSET_BASELINE_SYSTEM")) return "Asset Baseline System";
        if (normalized.equalsIgnoreCase("SERVICE_REDEMPTION")) return "Service Redemption";

        return userRepository.findByWalletAddressIgnoreCase(normalized)
                .map(user -> user.getName())
                .or(() -> patientRepository.findByWalletAddressIgnoreCase(normalized)
                        .flatMap(patient -> userRepository.findById(patient.getUserId()).map(user -> user.getName())))
                .orElse(fallback != null && !fallback.isBlank() ? fallback : normalized);
    }

    public List<ActivityLogDto> getPatientActivityLogs(UUID userId) {
        return activityLogRepository.findTop100ByUserIdOrderByTimestampDesc(userId)
                .stream()
                .map(activity -> new ActivityLogDto(
                        activity.getActId().toString(),
                        activity.getActivityName(),
                        activity.getDescription(),
                        activity.getType() != null ? activity.getType().name() : ActivityLog.ActivityType.ACTION.name(),
                        activity.getStatus(),
                        activity.getIpAddress(),
                        activity.getTimestamp() != null ? activity.getTimestamp().toString() : null
                ))
                .collect(Collectors.toList());
    }
}
