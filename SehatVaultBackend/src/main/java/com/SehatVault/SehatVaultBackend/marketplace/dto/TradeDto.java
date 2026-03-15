package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TradeDto {
    private UUID tradeId;
    private UUID hospitalId;

    private String tradeType; // BUY | SELL
    private String status; // OPEN | CLOSED | CANCELLED

    private String title;
    private String description;
    private String assetName;
    private String assetType;
    private BigDecimal buyPrice;
    private BigDecimal quantity;
    private LocalDate tradeDate;
    private BigDecimal currentValue;
    private BigDecimal exitValue;
    private BigDecimal unrealizedPnl;
    private BigDecimal realizedPnl;
    private String investment;
    private String location;
    private String notes;

    private BigDecimal amountInvested;
    private BigDecimal amountBeforeTrade;
    private BigDecimal amountAfterTrade;
    private BigDecimal profitLoss;
    private BigDecimal totalAtBurnt;

    private BigDecimal openingPrice;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal closingPrice;
    private BigDecimal volume;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
