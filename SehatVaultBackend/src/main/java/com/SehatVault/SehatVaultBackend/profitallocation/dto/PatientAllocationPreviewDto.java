package com.SehatVault.SehatVaultBackend.profitallocation.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PatientAllocationPreviewDto {
    private UUID patientId;
    private UUID userId;
    private UUID assetId;
    private String patientName;
    private String walletAddress;
    private BigDecimal assetContributionPkr;
    private BigDecimal sharePercent;
    private BigDecimal htAmount;
    private BigDecimal pkrValue;
}
