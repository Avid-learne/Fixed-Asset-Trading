package com.SehatVault.SehatVaultBackend.profitallocation.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ExecuteProfitAllocationResponse {
    private UUID distributionId;
    private Integer recipients;
    private BigDecimal totalHtDistributed;
    private BigDecimal patientAmountPkr;
    private BigDecimal hospitalAmountPkr;
}
