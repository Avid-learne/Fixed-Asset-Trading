package com.SehatVault.SehatVaultBackend.hospital.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class HospitalStaffSettingsResponse {
    private UUID userId;
    private String staffName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String bloodGroup;
    private String dateOfBirth;
    private String role;
    private String userStatus;

    private UUID hospitalId;
    private String hospitalName;

    private Boolean mfaEnabled;
    private Boolean notificationEnabled;
    private Boolean emailVerified;

    private List<HospitalStaffActivityItemDto> recentActivity;
}
