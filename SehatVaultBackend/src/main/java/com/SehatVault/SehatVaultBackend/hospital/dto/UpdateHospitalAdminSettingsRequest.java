package com.SehatVault.SehatVaultBackend.hospital.dto;

import lombok.Data;

@Data
public class UpdateHospitalAdminSettingsRequest {
    private String hospitalName;
    private String hospitalCode;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String city;

    private String adminName;
    private String adminPhone;

    private Boolean mfaEnabled;
    private Boolean notificationEnabled;
}
