package com.SehatVault.SehatVaultBackend.bankintegration.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class BankOptionDto {
    private UUID bankId;
    private String bankName;
    private String city;
    private String email;
    private String verificationStatus;
}
