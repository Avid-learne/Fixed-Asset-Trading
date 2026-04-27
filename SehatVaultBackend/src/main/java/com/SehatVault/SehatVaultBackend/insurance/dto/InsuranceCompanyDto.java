package com.SehatVault.SehatVaultBackend.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class InsuranceCompanyDto {
    private UUID insuranceCompanyId;
    private String companyName;
    private String registrationNumber;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
