package com.SehatVault.SehatVaultBackend.activity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDto {
    private String id;
    private String activityName;
    private String description;
    private String type;
    private String status;
    private String ipAddress;
    private String timestamp;
}
