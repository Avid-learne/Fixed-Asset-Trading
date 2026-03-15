package com.SehatVault.SehatVaultBackend.dashboard.dto;

import com.SehatVault.SehatVaultBackend.wallet.dto.WalletTransactionDto;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class PatientDashboardSummaryDto {
    private BigDecimal htBalance = BigDecimal.ZERO;
    private long pendingDeposits;
    private long approvedDeposits;
    private int healthCardCount;
    private boolean hasSubscription;
    private List<WalletTransactionDto> recentHtTransactions = new ArrayList<>();
}
