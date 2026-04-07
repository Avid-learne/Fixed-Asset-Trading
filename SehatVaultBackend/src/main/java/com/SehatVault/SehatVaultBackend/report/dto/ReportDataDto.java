package com.SehatVault.SehatVaultBackend.report.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ReportDataDto {
    private String reportType;
    private String fromPeriod;
    private String toPeriod;
    private String hospitalName;
    private String generatedAt;

    // Summary stats
    private long totalPatients;
    private long totalDeposits;
    private long pendingDeposits;
    private long approvedDeposits;
    private BigDecimal totalAssetValue = BigDecimal.ZERO;
    private BigDecimal totalAtMinted = BigDecimal.ZERO;
    private BigDecimal totalHtAllocated = BigDecimal.ZERO;
    private BigDecimal totalProfitDistributed = BigDecimal.ZERO;
    private BigDecimal tradingVolume = BigDecimal.ZERO;
    private long totalTrades;

    // Breakdowns
    private List<AssetBreakdown> assetBreakdown;
    private List<MonthlyData> monthlyData;

    @Data
    public static class AssetBreakdown {
        private String assetType;
        private long count;
        private BigDecimal totalValue;
    }

    @Data
    public static class MonthlyData {
        private String month;
        private long deposits;
        private BigDecimal mintedAt;
        private BigDecimal profitDistributed;
    }
}
