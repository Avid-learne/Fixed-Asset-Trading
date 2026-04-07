package com.SehatVault.SehatVaultBackend.notification.repository;

import com.SehatVault.SehatVaultBackend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findTop100ByReceiverIdOrderByTimestampDesc(UUID receiverId);

    List<Notification> findTop100BySenderIdOrderByTimestampDesc(UUID senderId);

    Optional<Notification> findByNotiIdAndReceiverId(UUID notiId, UUID receiverId);

    Optional<Notification> findByNotiIdAndSenderId(UUID notiId, UUID senderId);

    long countByReceiverIdAndStatus(UUID receiverId, Notification.NotificationStatus status);

    void deleteByNotiIdAndReceiverId(UUID notiId, UUID receiverId);

    void deleteByNotiIdAndSenderId(UUID notiId, UUID senderId);

    void deleteAllByReceiverId(UUID receiverId);

    void deleteAllBySenderId(UUID senderId);
}
