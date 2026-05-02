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
    private BigDecimal hospitalSharePercent;
    private BigDecimal bankSharePercent;
    private BigDecimal patientAmountPkr;
    private BigDecimal hospitalAmountPkr;
    private BigDecimal bankAmountPkr;
    private BigDecimal totalHtDistributed;
    private Integer recipients;
    /** Per-trade distributions: which trade was distributed. Null for legacy lump-sum rows. */
    private UUID tradeId;
    private String tradeName;
    /** AT credited to hospital from this distribution (no burn). */
    private BigDecimal hospitalAtCredited;
    /** AT credited to bank from this distribution (no burn). */
    private BigDecimal bankAtCredited;
}
