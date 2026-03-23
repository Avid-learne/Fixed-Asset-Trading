package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class HospitalAtPoolDto {
    private UUID hospitalId;
    private Integer patientCount;
    private Integer openTrades;

    private BigDecimal totalAtPool;
    private BigDecimal totalAtPoolPkr;

    private BigDecimal allocatedAt;
    private BigDecimal allocatedPkr;

    private BigDecimal availableAt;
    private BigDecimal availablePkr;
}
