package com.SehatVault.SehatVaultBackend.profitallocation.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ProfitDistributionHistoryItemDto {
    private UUID distributionId;
    private LocalDateTime timestamp;
    private BigDecimal totalProfit;
    private BigDecimal patientSharePercent;
    private BigDecimal patientAmountPkr;
    private BigDecimal hospitalAmountPkr;
    private BigDecimal totalHtDistributed;
    private Integer recipients;
}
