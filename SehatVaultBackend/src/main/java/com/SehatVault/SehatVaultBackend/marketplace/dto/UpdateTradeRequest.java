package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateTradeRequest {
    private String tradeType; // BUY | SELL
    private String status; // OPEN | CLOSED | CANCELLED
    private String assetName;
    private String assetType;
    private BigDecimal buyPrice;
    private BigDecimal quantity;
    private LocalDate tradeDate;
    private BigDecimal currentValue;
    private BigDecimal exitValue;

    private String title;
    private String description;
    private String investment;
    private String location;
    private BigDecimal openingPrice;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal closingPrice;
    private String notes;
}
