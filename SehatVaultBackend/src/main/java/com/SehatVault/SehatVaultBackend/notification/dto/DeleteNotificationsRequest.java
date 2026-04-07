package com.SehatVault.SehatVaultBackend.notification.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class DeleteNotificationsRequest {
    private List<UUID> notificationIds;
}
