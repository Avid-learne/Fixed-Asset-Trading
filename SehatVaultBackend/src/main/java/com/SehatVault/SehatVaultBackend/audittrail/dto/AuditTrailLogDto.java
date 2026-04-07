package com.SehatVault.SehatVaultBackend.audittrail.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditTrailLogDto {
    private String id;
    private String activityName;
    private String description;
    private String type;
    private String status;
    private String ipAddress;
    private String timestamp;
    private String userId;
    private String user;
    private String userRole;
}
