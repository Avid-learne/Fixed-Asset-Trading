package com.SehatVault.SehatVaultBackend.profitallocation.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProfitAllocationPreviewResponse {
    private BigDecimal availableProfit;
    private BigDecimal totalProfit;
    private BigDecimal patientSharePercent;
    private BigDecimal hospitalSharePercent;
    private BigDecimal patientAmountPkr;
    private BigDecimal hospitalAmountPkr;
    private BigDecimal htConversionRate;
    private BigDecimal totalHtToDistribute;
    private BigDecimal totalAtHolding;
    private Integer totalRecipients;
    private List<PatientAllocationPreviewDto> allocations;
}
