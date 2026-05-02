package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateTradeRequest {
    private UUID hospitalId;
    private String tradeType; // BUY | SELL
    private String assetName;
    private String assetType;
    private BigDecimal buyPrice;
    private BigDecimal quantity;
    private LocalDate tradeDate;
    private BigDecimal currentValue;

    private String title;
    private String description;
    private String investment;
    private String location;
    private BigDecimal openingPrice;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal closingPrice;
    private String notes;

    /**
     * Per-patient AT contributions for this trade. Each entry locks the chosen amount of
     * AT from a Pool 2 (AVAILABLE) assignment and creates a TradeParticipation. When the
     * trade settles, profit/loss is shared only among these participants.
     */
    private java.util.List<ParticipantSelection> selections;

    @Data
    public static class ParticipantSelection {
        private UUID patientId;
        private UUID assetId;
        private BigDecimal atAmount;
    }
}
