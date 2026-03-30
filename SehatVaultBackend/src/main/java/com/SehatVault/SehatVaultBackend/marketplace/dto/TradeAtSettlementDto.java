package com.SehatVault.SehatVaultBackend.marketplace.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for TradeAtSettlement responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TradeAtSettlementDto {
    private UUID settlementId;
    private UUID tradeId;
    private UUID participationId;
    private UUID patientId;
    private BigDecimal originalAtAllocated;
    private BigDecimal tradeProfitLoss;
    private BigDecimal atReturnedAvailable;
    private BigDecimal profitPercentage;
    private BigDecimal profitHtIssued;
    private BigDecimal totalMonthlyHtIssued;
    private BigDecimal totalHtIssued;
    private LocalDateTime tradeEndTime;
    private LocalDateTime settledAt;
    private LocalDateTime createdAt;
}
