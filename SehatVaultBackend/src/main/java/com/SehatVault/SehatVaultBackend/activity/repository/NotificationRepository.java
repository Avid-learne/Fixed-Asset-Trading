package com.SehatVault.SehatVaultBackend.activity.repository;

import com.SehatVault.SehatVaultBackend.activity.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findTop100ByReceiverIdOrderByTimestampDesc(UUID receiverId);
}
