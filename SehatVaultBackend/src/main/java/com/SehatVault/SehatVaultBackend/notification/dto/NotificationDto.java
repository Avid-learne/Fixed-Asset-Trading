package com.SehatVault.SehatVaultBackend.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id;
    private String title;
    private String body;
    private String status;
    private String timestamp;
    private String direction;
    private String senderName;
    private String notificationType;
    private String navigationUrl;
}
