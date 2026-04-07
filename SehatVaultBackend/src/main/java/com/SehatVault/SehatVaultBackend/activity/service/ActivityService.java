package com.SehatVault.SehatVaultBackend.activity.service;

import com.SehatVault.SehatVaultBackend.activity.dto.ActivityLogDto;
import com.SehatVault.SehatVaultBackend.activity.dto.ActivityTransactionDto;
import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.activity.repository.TransactionRepository;
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
                            row.getDescription(),
                            row.getTransactionType(),
                            row.getBlockNumber()
                    );
                })
                .collect(Collectors.toList());
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
