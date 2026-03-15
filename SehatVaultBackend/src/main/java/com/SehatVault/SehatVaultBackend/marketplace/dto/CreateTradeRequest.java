package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateTradeRequest {
    private UUID hospitalId;
    private String tradeType; // BUY | SELL
    private String investment;
    private String location;
    private BigDecimal openingPrice;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal closingPrice;
    private BigDecimal volume;
    private BigDecimal liquidity;
    private String notes;
}
