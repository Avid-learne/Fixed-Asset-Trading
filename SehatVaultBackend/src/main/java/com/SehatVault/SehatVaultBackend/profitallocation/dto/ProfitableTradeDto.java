package com.SehatVault.SehatVaultBackend.profitallocation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Row in the "Profitable Trades" table on the Profit Allocation page. Represents a closed
 * trade that produced positive P&L and is either ready to distribute or already distributed.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfitableTradeDto {
    private UUID tradeId;
    private String tradeName;
    private String assetType;
    private LocalDateTime tradeDate;
    private LocalDateTime closedAt;
    /** The trade's gross profit in PKR (= amountAfterTrade − amountInvested, only when > 0). */
    private BigDecimal profitPkr;
    /** Same profit converted to AT at the live AT price. */
    private BigDecimal profitAt;
    /** True if a ProfitDistribution row already references this tradeId. */
    private boolean distributed;
    /** Timestamp of the past distribution, if {@code distributed} is true. */
    private LocalDateTime distributedAt;
    private UUID distributionId;
}
