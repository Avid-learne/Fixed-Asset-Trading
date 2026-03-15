package com.SehatVault.SehatVaultBackend.assetdeposit.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class HospitalOptionDto {
    private UUID hospitalId;
    private String hospitalName;
    private String city;
}
