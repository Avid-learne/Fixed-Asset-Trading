package com.SehatVault.SehatVaultBackend.dashboard.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class HospitalDashboardSummaryDto {
    private String hospitalName;
    private long totalPatients;
    private long pendingDeposits;
    private long approvedDeposits;
    private long activeSubscriptions;
    private BigDecimal totalProfitDistributed = BigDecimal.ZERO;
}
