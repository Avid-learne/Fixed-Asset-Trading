package com.SehatVault.SehatVaultBackend.hospital.dto;

import lombok.Data;

@Data
public class HospitalStaffActivityItemDto {
    private String activityId;
    private String activityName;
    private String description;
    private String type;
    private String status;
    private String ipAddress;
    private String timestamp;
}
