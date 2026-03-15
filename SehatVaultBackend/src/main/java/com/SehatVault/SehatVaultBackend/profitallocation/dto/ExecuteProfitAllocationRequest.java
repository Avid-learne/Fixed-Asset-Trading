package com.SehatVault.SehatVaultBackend.profitallocation.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExecuteProfitAllocationRequest {
    private BigDecimal totalProfit;
    private BigDecimal patientSharePercent;
}
