package com.SehatVault.SehatVaultBackend.hospital.dto;

import lombok.Data;

@Data
public class UpdateHospitalStaffSettingsRequest {
    private String staffName;
    private String phone;
    private String address;
    private String city;
    private String bloodGroup;
    private String dateOfBirth;
    private Boolean mfaEnabled;
    private Boolean notificationEnabled;
}
