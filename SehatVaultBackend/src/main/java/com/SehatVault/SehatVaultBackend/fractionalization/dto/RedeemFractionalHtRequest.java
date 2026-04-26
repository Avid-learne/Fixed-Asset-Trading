package com.SehatVault.SehatVaultBackend.fractionalization.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class RedeemFractionalHtRequest {
    private UUID allocationId;
    private BigDecimal amount;
    private String reason;
}
