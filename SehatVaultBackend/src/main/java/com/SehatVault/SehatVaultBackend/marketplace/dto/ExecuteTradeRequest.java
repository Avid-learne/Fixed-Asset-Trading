package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ExecuteTradeRequest {

    private UUID hospitalId;
    private String tradeType;
    private String assetName;
    private String assetType;
    private String investment;
    private String title;
    private String description;
    private String location;
    private String notes;

    private BigDecimal amountInvested;
    private BigDecimal openingPrice;
    private BigDecimal quantity;
    private BigDecimal totalAtBurned;

    private BigDecimal patientsPercentage;
    private BigDecimal hospitalOperationsPercentage;
    private BigDecimal bankLoanPercentage;
}
