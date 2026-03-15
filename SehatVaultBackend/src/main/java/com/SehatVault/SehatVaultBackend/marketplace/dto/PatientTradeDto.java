package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PatientTradeDto {
    private UUID tradeId;
    private String tradeName;
    private String assetType;
    private BigDecimal investmentAmount;
    private BigDecimal currentValue;
    private BigDecimal pnl;
}
