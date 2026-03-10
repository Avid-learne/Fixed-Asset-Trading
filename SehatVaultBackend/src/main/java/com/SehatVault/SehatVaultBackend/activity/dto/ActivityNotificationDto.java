package com.SehatVault.SehatVaultBackend.activity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityNotificationDto {
    private String id;
    private String title;
    private String body;
    private String status;
    private String timestamp;
}
