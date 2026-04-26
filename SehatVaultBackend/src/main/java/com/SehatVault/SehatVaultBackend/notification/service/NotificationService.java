package com.SehatVault.SehatVaultBackend.notification.service;

import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.bank.entity.Bank;
import com.SehatVault.SehatVaultBackend.bank.repository.BankRepository;
import com.SehatVault.SehatVaultBackend.bankintegration.entity.Partnership;
import com.SehatVault.SehatVaultBackend.bankintegration.repository.PartnershipRepository;
import com.SehatVault.SehatVaultBackend.notification.dto.NotificationDto;
import com.SehatVault.SehatVaultBackend.notification.dto.SendNotificationRequest;
import com.SehatVault.SehatVaultBackend.notification.dto.SendNotificationResponse;
import com.SehatVault.SehatVaultBackend.notification.entity.Notification;
import com.SehatVault.SehatVaultBackend.notification.repository.NotificationRepository;
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
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BankRepository bankRepository;
    private final PartnershipRepository partnershipRepository;

    // ─── READ ───────────────────────────────────────────

    public List<NotificationDto> getUserNotifications(UUID userId) {
        return notificationRepository.findTop100ByReceiverIdOrderByTimestampDesc(userId)
                .stream()
                .map(n -> toDto(n, "received",
                        userRepository.findById(n.getSenderId()).map(User::getName).orElse("System")))
                .toList();
    }

    public List<NotificationDto> getSentNotifications(UUID userId) {
        return notificationRepository.findTop100BySenderIdOrderByTimestampDesc(userId)
                .stream()
                .map(n -> toDto(n, "sent",
                        userRepository.findById(n.getReceiverId()).map(User::getName).orElse("Unknown")))
                .toList();
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByReceiverIdAndStatus(userId, Notification.NotificationStatus.UNREAD);
    }

    // ─── MARK READ ──────────────────────────────────────

    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findByNotiIdAndReceiverId(notificationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setStatus(Notification.NotificationStatus.READ);
        notificationRepository.save(notification);
    }

    @Transactional
    public int markAllAsRead(UUID userId) {
        List<Notification> notifications = notificationRepository.findTop100ByReceiverIdOrderByTimestampDesc(userId);
        int updated = 0;
        for (Notification n : notifications) {
            if (n.getStatus() == Notification.NotificationStatus.UNREAD) {
                n.setStatus(Notification.NotificationStatus.READ);
                updated++;
            }
        }
        if (updated > 0) {
            notificationRepository.saveAll(notifications);
        }
        return updated;
    }

    // ─── DELETE ──────────────────────────────────────────

    @Transactional
    public void deleteReceivedNotification(UUID userId, UUID notificationId) {
        notificationRepository.findByNotiIdAndReceiverId(notificationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notificationRepository.deleteByNotiIdAndReceiverId(notificationId, userId);
    }

    @Transactional
    public void deleteSentNotification(UUID userId, UUID notificationId) {
        notificationRepository.findByNotiIdAndSenderId(notificationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notificationRepository.deleteByNotiIdAndSenderId(notificationId, userId);
    }

    @Transactional
    public int deleteSelectedReceivedNotifications(UUID userId, List<UUID> notificationIds) {
        int deleted = 0;
        for (UUID notiId : notificationIds) {
            if (notificationRepository.findByNotiIdAndReceiverId(notiId, userId).isPresent()) {
                notificationRepository.deleteByNotiIdAndReceiverId(notiId, userId);
                deleted++;
            }
        }
        return deleted;
    }

    @Transactional
    public int deleteSelectedSentNotifications(UUID userId, List<UUID> notificationIds) {
        int deleted = 0;
        for (UUID notiId : notificationIds) {
            if (notificationRepository.findByNotiIdAndSenderId(notiId, userId).isPresent()) {
                notificationRepository.deleteByNotiIdAndSenderId(notiId, userId);
                deleted++;
            }
        }
        return deleted;
    }

    @Transactional
    public int deleteAllReceivedNotifications(UUID userId) {
        long count = notificationRepository.findTop100ByReceiverIdOrderByTimestampDesc(userId).size();
        if (count > 0) {
            notificationRepository.deleteAllByReceiverId(userId);
        }
        return (int) count;
    }

    @Transactional
    public int deleteAllSentNotifications(UUID userId) {
        long count = notificationRepository.findTop100BySenderIdOrderByTimestampDesc(userId).size();
        if (count > 0) {
            notificationRepository.deleteAllBySenderId(userId);
        }
        return (int) count;
    }

    // ─── SEND ───────────────────────────────────────────

    @Transactional
    public SendNotificationResponse send(UUID senderUserId, SendNotificationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        String targetType = request.getTargetType() == null ? "USER" : request.getTargetType().trim().toUpperCase(Locale.ROOT);
        String title = sanitize(request.getTitle(), "Notification");
        String message = request.getMessage() == null ? "" : request.getMessage().trim();
        if (message.isEmpty()) {
            throw new IllegalArgumentException("message is required");
        }

        Set<UUID> receiverIds = resolveRecipients(senderUserId, targetType, request);
        if (receiverIds.isEmpty()) {
            throw new IllegalArgumentException("No recipients found for target selection");
        }

        List<Notification> batch = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        String payload = title + "::" + message;

        for (UUID receiverId : receiverIds) {
            Notification n = new Notification();
            n.setSenderId(senderUserId);
            n.setReceiverId(receiverId);
            n.setNotificationText(payload);
            n.setStatus(Notification.NotificationStatus.UNREAD);
            n.setTimestamp(now);
            batch.add(n);
        }

        notificationRepository.saveAll(batch);
        return new SendNotificationResponse(batch.size());
    }

    @Transactional
    public void notifyUser(UUID senderUserId, UUID receiverUserId, String title, String message) {
        if (senderUserId == null || receiverUserId == null) {
            return;
        }
        String safeTitle = sanitize(title, "Notification");
        String safeMessage = message == null ? "" : message.trim();
        if (safeMessage.isEmpty()) {
            return;
        }
        Notification n = new Notification();
        n.setSenderId(senderUserId);
        n.setReceiverId(receiverUserId);
        n.setNotificationText(safeTitle + "::" + safeMessage);
        n.setStatus(Notification.NotificationStatus.UNREAD);
        n.setTimestamp(LocalDateTime.now());
        notificationRepository.save(n);
    }

    @Transactional
    public int notifyUsers(UUID senderUserId, Set<UUID> receiverIds, String title, String message) {
        if (senderUserId == null || receiverIds == null || receiverIds.isEmpty()) {
            return 0;
        }
        String safeTitle = sanitize(title, "Notification");
        String safeMessage = message == null ? "" : message.trim();
        if (safeMessage.isEmpty()) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        String payload = safeTitle + "::" + safeMessage;
        List<Notification> batch = receiverIds.stream()
                .filter(receiverId -> receiverId != null)
                .map(receiverId -> {
                    Notification n = new Notification();
                    n.setSenderId(senderUserId);
                    n.setReceiverId(receiverId);
                    n.setNotificationText(payload);
                    n.setStatus(Notification.NotificationStatus.UNREAD);
                    n.setTimestamp(now);
                    return n;
                })
                .toList();
        if (batch.isEmpty()) {
            return 0;
        }
        notificationRepository.saveAll(batch);
        return batch.size();
    }

    // ─── PRIVATE HELPERS ────────────────────────────────

    private Set<UUID> resolveRecipients(UUID senderUserId, String targetType, SendNotificationRequest request) {
        Set<UUID> recipients = new HashSet<>();

        switch (targetType) {
            case "ALL_USERS" -> userRepository.findAll().forEach(u -> recipients.add(u.getUserId()));

            case "ROLE" -> {
                String role = request.getTargetRole();
                if (role == null || role.isBlank()) {
                    throw new IllegalArgumentException("targetRole is required for ROLE target type");
                }
                Role.RoleType roleType = Role.RoleType.valueOf(role.trim().toLowerCase(Locale.ROOT));
                userRepository.findAll().stream()
                        .filter(u -> u.getRole() != null && u.getRole().getRoleName() == roleType)
                        .forEach(u -> recipients.add(u.getUserId()));
            }

            case "HOSPITAL" -> {
                if (request.getHospitalId() == null) {
                    throw new IllegalArgumentException("hospitalId is required for HOSPITAL target type");
                }
                userRepository.findAll().stream()
                        .filter(u -> request.getHospitalId().equals(u.getHospitalId()))
                        .forEach(u -> recipients.add(u.getUserId()));
            }

            case "USER" -> {
                if (request.getReceiverUserId() == null) {
                    throw new IllegalArgumentException("receiverUserId is required for USER target type");
                }
                recipients.add(request.getReceiverUserId());
            }

            case "BANK_HOSPITALS" -> {
                Set<Role.RoleType> hospitalRoles = Set.of(Role.RoleType.hospital_admin, Role.RoleType.hospital_staff);

                if (request.getHospitalId() != null) {
                    userRepository.findAll().stream()
                            .filter(u -> request.getHospitalId().equals(u.getHospitalId())
                                    && u.getRole() != null
                                    && hospitalRoles.contains(u.getRole().getRoleName()))
                            .forEach(u -> recipients.add(u.getUserId()));
                } else {
                    User sender = userRepository.findById(senderUserId)
                            .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
                    Bank bank = bankRepository.findByEmail(sender.getEmail())
                            .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));
                    List<Partnership> approved = partnershipRepository.findByBankIdOrderByCreatedAtDesc(bank.getBankId())
                            .stream()
                            .filter(p -> p.getIntegrationStatus() == Partnership.IntegrationStatus.APPROVED)
                            .toList();
                    if (approved.isEmpty()) {
                        throw new IllegalArgumentException("No approved hospital integrations found");
                    }
                    Set<UUID> hospitalIds = approved.stream()
                            .map(Partnership::getHospitalId)
                            .collect(Collectors.toSet());
                    userRepository.findAll().stream()
                            .filter(u -> u.getHospitalId() != null
                                    && hospitalIds.contains(u.getHospitalId())
                                    && u.getRole() != null
                                    && hospitalRoles.contains(u.getRole().getRoleName()))
                            .forEach(u -> recipients.add(u.getUserId()));
                }
            }

            default -> throw new IllegalArgumentException("targetType must be one of ALL_USERS, ROLE, HOSPITAL, BANK_HOSPITALS, USER");
        }

        return recipients;
    }

    private NotificationDto toDto(Notification n, String direction, String displayName) {
        return new NotificationDto(
                n.getNotiId().toString(),
                extractTitle(n.getNotificationText(), n.getStatus()),
                extractBody(n.getNotificationText()),
                n.getStatus() != null ? n.getStatus().name() : "UNREAD",
                n.getTimestamp() != null ? n.getTimestamp().toString() : null,
                direction,
                displayName
        );
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
        if (payload == null || payload.isBlank()) return "";
        int idx = payload.indexOf("::");
        if (idx <= 0 || idx + 2 >= payload.length()) return payload;
        return payload.substring(idx + 2).trim();
    }

    private String sanitize(String value, String fallback) {
        String v = value == null ? fallback : value.trim();
        return v.isEmpty() ? fallback : v;
    }
}
