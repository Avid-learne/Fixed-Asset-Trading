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
    private BigDecimal atHolding;
    private BigDecimal sharePercent;
    private BigDecimal htAmount;
    private BigDecimal pkrValue;
}
