package com.SehatVault.SehatVaultBackend.dashboard.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class SuperAdminDashboardSummaryDto {
    private long totalHospitals;
    private long activeHospitals;
    private long pendingHospitals;
    private long disabledHospitals;

    private long totalBanks;
    private long activeBanks;
    private long pendingBanks;
    private long disabledBanks;

    private long totalPatients;
    private long activePatients;

    private BigDecimal totalATMinted = BigDecimal.ZERO;
    private BigDecimal totalHTIssued = BigDecimal.ZERO;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private BigDecimal totalTransactionVolume = BigDecimal.ZERO;

    private double systemUptime = 99.99;

    private List<HospitalOverview> hospitals = new ArrayList<>();
    private List<BankOverview> banks = new ArrayList<>();
    private List<MarketplaceTradeOverview> marketplaceTrades = new ArrayList<>();

    @Data
    public static class HospitalOverview {
        private UUID hospitalId;
        private String hospitalName;
        private long patientCount;
        private String verificationStatus;
        private BigDecimal totalAssets = BigDecimal.ZERO;
        private BigDecimal totalAT = BigDecimal.ZERO;
        private LocalDateTime createdAt;
    }

    @Data
    public static class BankOverview {
        private UUID bankId;
        private String bankName;
        private long activePartnerships;
        private String verificationStatus;
        private BigDecimal totalDeposits = BigDecimal.ZERO;
        private LocalDateTime createdAt;
    }

    @Data
    public static class MarketplaceTradeOverview {
        private UUID tradeId;
        private UUID hospitalId;
        private String hospitalName;
        private String tradeTitle;
        private String tradeType;
        private String status;
        private BigDecimal amountInvested = BigDecimal.ZERO;
        private BigDecimal profitLoss = BigDecimal.ZERO;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
    }
}