package com.SehatVault.SehatVaultBackend.dashboard.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class HospitalDashboardSummaryDto {
    private String hospitalName;
    private long totalPatients;
    private long pendingDeposits;
    private long approvedDeposits;
    private long activeSubscriptions;
    private BigDecimal totalProfitDistributed = BigDecimal.ZERO;

    // New fields for a real dashboard
    private BigDecimal totalAtMinted = BigDecimal.ZERO;
    private BigDecimal totalHtAllocated = BigDecimal.ZERO;
    private BigDecimal totalAssetValue = BigDecimal.ZERO;
    private BigDecimal tradingVolume = BigDecimal.ZERO;
    private long totalTrades;
    private long activeTrades;

    // Asset prices
    private double goldPricePerGram;
    private double silverPricePerGram;

    // Asset distribution (by type with PKR value)
    private List<AssetDistribution> assetDistribution;

    // Monthly chart data
    private List<MonthlyMintData> mintingHistory;
    private List<MonthlyAllocationData> allocationHistory;

    @Data
    public static class MonthlyMintData {
        private String month;
        private BigDecimal minted;
    }

    @Data
    public static class MonthlyAllocationData {
        private String month;
        private BigDecimal allocated;
    }

    @Data
    public static class AssetDistribution {
        private String assetType;
        private long count;
        private BigDecimal totalValue;
    }
}
