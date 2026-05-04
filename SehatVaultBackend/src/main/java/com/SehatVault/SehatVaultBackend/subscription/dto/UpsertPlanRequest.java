package com.SehatVault.SehatVaultBackend.subscription.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpsertPlanRequest {
    private String subscriptionName;
    private BigDecimal amountPerMonth;
    private List<String> features;
    private Integer monthlyHt;
}
