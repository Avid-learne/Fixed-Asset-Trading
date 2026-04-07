package com.SehatVault.SehatVaultBackend.wallet.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class DeductHtRequest {
    private UUID patientUserId;
    private BigDecimal amount;
    private String reason;
}
