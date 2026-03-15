package com.SehatVault.SehatVaultBackend.hospital.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class HospitalAdminSettingsResponse {
    private UUID hospitalId;
    private String hospitalName;
    private String hospitalCode;
    private String registrationNum;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String city;
    private String verificationStatus;

    private Double totalAssets;
    private Double totalAT;
    private Integer totalPatients;

    private String adminName;
    private String adminEmail;
    private String adminPhone;

    private Boolean mfaEnabled;
    private Boolean notificationEnabled;
    private Boolean emailVerified;
}
