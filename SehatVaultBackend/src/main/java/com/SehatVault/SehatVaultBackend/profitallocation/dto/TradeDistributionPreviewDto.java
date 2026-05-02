package com.SehatVault.SehatVaultBackend.profitallocation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Per-trade distribution preview. The "row" list contains every patient who funded the
 * trade plus a synthetic Hospital row and Bank row, so the UI table can render a single
 * unified list with the totals matching the trade's profit.
 *
 * Patient rows: AT is burned and equivalent HT is minted to the patient's wallet.
 * Hospital/Bank rows: AT is credited to a notional hospital/bank balance — no burn.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TradeDistributionPreviewDto {

    public enum RowKind { PATIENT, HOSPITAL, BANK }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Row {
        private RowKind kind;
        /** PATIENT rows only: patient/asset identifiers + name. */
        private UUID patientId;
        private UUID assetId;
        private String name;
        /** PATIENT rows only: their share of the patient pool, proportional to their
         *  originalAtAllocated for this trade. Hospital/Bank rows: 100% of their pool. */
        private BigDecimal sharePercent;
        /** AT credited (Hospital/Bank) or burned-and-converted-to-HT (Patient). */
        private BigDecimal atAmount;
        /** PKR equivalent of atAmount at the AT price. */
        private BigDecimal pkrAmount;
        /** PATIENT rows only: HT minted in exchange for the burned AT. */
        private BigDecimal htAmount;
    }

    private UUID tradeId;
    private String tradeName;
    private String assetType;

    /** The trade's gross profit (PKR + AT). This is the total to be distributed. */
    private BigDecimal totalProfitPkr;
    private BigDecimal totalProfitAt;

    /** Hospital's configured split percentages snapshotted into the preview. */
    private BigDecimal patientSharePercent;
    private BigDecimal hospitalSharePercent;
    private BigDecimal bankSharePercent;

    /** Pre-aggregated pool sizes for the three buckets, all in AT (= profit_at × pct/100). */
    private BigDecimal patientPoolAt;
    private BigDecimal hospitalPoolAt;
    private BigDecimal bankPoolAt;

    private BigDecimal htConversionRate;
    private BigDecimal atPrice;

    /** True if this trade was already distributed (UI greys out the Distribute button). */
    private boolean alreadyDistributed;

    /** Patient rows + Hospital row + Bank row, in that order. */
    private List<Row> rows;
}
