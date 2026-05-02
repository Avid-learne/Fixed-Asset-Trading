package com.SehatVault.SehatVaultBackend.profitallocation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Top-line KPIs for the Profit Allocation page. Cumulative since inception, computed
 * from the ProfitDistribution rows for this hospital.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AllocationKpisDto {
    /** Sum of profit from CLOSED trades not yet covered by any per-trade ProfitDistribution. */
    private BigDecimal availableProfitPkr;
    private BigDecimal availableProfitAt;

    /** Cumulative AT credited to the hospital across all past distributions. */
    private BigDecimal hospitalProfitAt;
    private BigDecimal hospitalProfitPkr;

    /** Cumulative AT credited to the bank across all past distributions. */
    private BigDecimal bankProfitAt;
    private BigDecimal bankProfitPkr;

    /** Cumulative HT minted to patients across all past distributions. */
    private BigDecimal totalHtMintedToPatients;

    private int distributionsCount;
    private int profitableTradesCount;
    private int undistributedTradesCount;
}
