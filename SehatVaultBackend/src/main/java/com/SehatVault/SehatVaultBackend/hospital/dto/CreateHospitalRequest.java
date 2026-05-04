package com.SehatVault.SehatVaultBackend.hospital.dto;

import lombok.Data;

@Data
public class CreateHospitalRequest {
    private String name;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private String registrationNumber;
    private String city;
}
