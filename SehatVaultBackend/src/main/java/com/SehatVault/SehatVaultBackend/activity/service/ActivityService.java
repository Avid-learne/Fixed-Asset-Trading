package com.SehatVault.SehatVaultBackend.activity.service;

import com.SehatVault.SehatVaultBackend.activity.dto.ActivityLogDto;
import com.SehatVault.SehatVaultBackend.activity.dto.ActivityNotificationDto;
import com.SehatVault.SehatVaultBackend.activity.dto.ActivityTransactionDto;
import com.SehatVault.SehatVaultBackend.activity.dto.SendNotificationRequest;
import com.SehatVault.SehatVaultBackend.activity.dto.SendNotificationResponse;
import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.entity.Notification;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.activity.repository.NotificationRepository;
import com.SehatVault.SehatVaultBackend.activity.repository.TransactionRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;
        private final UserRepository userRepository;

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

    public List<ActivityNotificationDto> getPatientNotifications(UUID userId) {
                return getUserNotifications(userId);
        }

        public List<ActivityNotificationDto> getUserNotifications(UUID userId) {
                return notificationRepository.findTop100ByReceiverIdOrderByTimestampDesc(userId)
                .stream()
                .map(notification -> new ActivityNotificationDto(
                        notification.getNotiId().toString(),
                                                extractTitle(notification.getNotificationText(), notification.getStatus()),
                                                extractBody(notification.getNotificationText()),
                        notification.getStatus() != null ? notification.getStatus().name() : "UNREAD",
                        notification.getTimestamp() != null ? notification.getTimestamp().toString() : null
                ))
                .collect(Collectors.toList());
    }

        @Transactional
        public void markNotificationAsRead(UUID userId, UUID notificationId) {
                Notification notification = notificationRepository.findByNotiIdAndReceiverId(notificationId, userId)
                        .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

                notification.setStatus(Notification.NotificationStatus.READ);
                notificationRepository.save(notification);
        }

        @Transactional
        public int markAllNotificationsAsRead(UUID userId) {
                List<Notification> notifications = notificationRepository.findTop100ByReceiverIdOrderByTimestampDesc(userId);
                int updated = 0;
                for (Notification notification : notifications) {
                        if (notification.getStatus() == Notification.NotificationStatus.UNREAD) {
                                notification.setStatus(Notification.NotificationStatus.READ);
                                updated++;
                        }
                }
                if (updated > 0) {
                        notificationRepository.saveAll(notifications);
                }
                return updated;
        }

        public long getUnreadCount(UUID userId) {
                return notificationRepository.countByReceiverIdAndStatus(userId, Notification.NotificationStatus.UNREAD);
        }

        @Transactional
        public SendNotificationResponse sendNotification(UUID senderUserId, SendNotificationRequest request) {
                if (request == null) {
                        throw new IllegalArgumentException("Request body is required");
                }

                String targetType = request.getTargetType() == null ? "USER" : request.getTargetType().trim().toUpperCase(Locale.ROOT);
                String title = sanitizeTitle(request.getTitle());
                String message = sanitizeMessage(request.getMessage());

                Set<UUID> receiverIds = resolveRecipients(targetType, request);
                if (receiverIds.isEmpty()) {
                        throw new IllegalArgumentException("No recipients found for target selection");
                }

                List<Notification> batch = new ArrayList<>();
                LocalDateTime now = LocalDateTime.now();
                String payload = title + "::" + message;

                for (UUID receiverId : receiverIds) {
                        Notification notification = new Notification();
                        notification.setSenderId(senderUserId);
                        notification.setReceiverId(receiverId);
                        notification.setNotificationText(payload);
                        notification.setStatus(Notification.NotificationStatus.UNREAD);
                        notification.setTimestamp(now);
                        batch.add(notification);
                }

                notificationRepository.saveAll(batch);
                return new SendNotificationResponse(batch.size());
        }

        private Set<UUID> resolveRecipients(String targetType, SendNotificationRequest request) {
                Set<UUID> recipients = new HashSet<>();

                switch (targetType) {
                        case "ALL_USERS" -> userRepository.findAll().forEach(user -> recipients.add(user.getUserId()));
                        case "ROLE" -> {
                                String role = request.getTargetRole();
                                if (role == null || role.isBlank()) {
                                        throw new IllegalArgumentException("targetRole is required for ROLE target type");
                                }
                                Role.RoleType roleType = Role.RoleType.valueOf(role.trim().toLowerCase(Locale.ROOT));
                                userRepository.findAll().stream()
                                        .filter(user -> user.getRole() != null && user.getRole().getRoleName() == roleType)
                                        .forEach(user -> recipients.add(user.getUserId()));
                        }
                        case "HOSPITAL" -> {
                                if (request.getHospitalId() == null) {
                                        throw new IllegalArgumentException("hospitalId is required for HOSPITAL target type");
                                }
                                userRepository.findAll().stream()
                                        .filter(user -> request.getHospitalId().equals(user.getHospitalId()))
                                        .forEach(user -> recipients.add(user.getUserId()));
                        }
                        case "USER" -> {
                                if (request.getReceiverUserId() == null) {
                                        throw new IllegalArgumentException("receiverUserId is required for USER target type");
                                }
                                recipients.add(request.getReceiverUserId());
                        }
                        default -> throw new IllegalArgumentException("targetType must be one of ALL_USERS, ROLE, HOSPITAL, USER");
                }

                return recipients;
        }

        private String sanitizeTitle(String title) {
                String value = title == null ? "Notification" : title.trim();
                if (value.isEmpty()) {
                        value = "Notification";
                }
                return value;
        }

        private String sanitizeMessage(String message) {
                String value = message == null ? "" : message.trim();
                if (value.isEmpty()) {
                        throw new IllegalArgumentException("message is required");
                }
                return value;
        }

        private String extractTitle(String payload, Notification.NotificationStatus status) {
                if (payload == null || payload.isBlank()) {
                        return status == Notification.NotificationStatus.UNREAD ? "New Notification" : "Notification";
                }
                int idx = payload.indexOf("::");
                if (idx <= 0) {
                        return status == Notification.NotificationStatus.UNREAD ? "New Notification" : "Notification";
                }
                return payload.substring(0, idx).trim();
        }

        private String extractBody(String payload) {
                if (payload == null || payload.isBlank()) {
                        return "";
                }
                int idx = payload.indexOf("::");
                if (idx <= 0 || idx + 2 >= payload.length()) {
                        return payload;
                }
                return payload.substring(idx + 2).trim();
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
