package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Request DTOs for AT Trading endpoints
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartTradeWithAtRequest {
    private UUID tradeId;
    private UUID patientId;
    private UUID assetId;
    private UUID assignmentId;
    private BigDecimal atAmount;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class RequestAtWithdrawalRequest {
    private UUID patientId;
    private UUID assetId;
    private UUID tradeId;
    private UUID assignmentId;
    private String reason;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ApproveWithdrawalRequest {
    private UUID requestId;
    private Integer tradeRemainingDays;
    private String hospitalNotes;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class SettleTradeRequest {
    private UUID tradeId;
    private BigDecimal profitLoss;
}
