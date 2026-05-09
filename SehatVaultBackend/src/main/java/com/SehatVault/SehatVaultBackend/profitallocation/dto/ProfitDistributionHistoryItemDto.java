package com.SehatVault.SehatVaultBackend.profitallocation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ProfitDistributionHistoryItemDto {
    private UUID distributionId;
    private LocalDateTime timestamp;
    private BigDecimal totalProfit;
    private BigDecimal patientSharePercent;
    private BigDecimal hospitalSharePercent;
    private BigDecimal bankSharePercent;
    private BigDecimal patientAmountPkr;
    private BigDecimal hospitalAmountPkr;
    private BigDecimal bankAmountPkr;
    private BigDecimal totalHtDistributed;
    private Integer recipients;
    private List<RecipientDto> recipientDetails;

    private UUID tradeId;
    private String tradeTitle;
    private String tradeDescription;
    private String tradeType;
    private BigDecimal tradeProfitLoss;
    private LocalDateTime tradeEndTime;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipientDto {
        private UUID patientId;
        private String patientName;
        private BigDecimal htAmount;
        private BigDecimal sharePercent;
    }
}
