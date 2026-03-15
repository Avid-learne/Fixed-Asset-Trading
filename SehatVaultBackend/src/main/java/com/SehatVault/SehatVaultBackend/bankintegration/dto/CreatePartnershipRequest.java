package com.SehatVault.SehatVaultBackend.bankintegration.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CreatePartnershipRequest {
    private UUID bankId;
}
