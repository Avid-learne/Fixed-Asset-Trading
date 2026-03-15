package com.SehatVault.SehatVaultBackend.dashboard.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class BankDashboardSummaryDto {
    private String bankName;
    private long totalDeposits;
    private long pendingReviews;
    private long approvedReviews;
    private long rejectedReviews;
    private BigDecimal totalAssetValue = BigDecimal.ZERO;
    private long activePartnerships;
}
