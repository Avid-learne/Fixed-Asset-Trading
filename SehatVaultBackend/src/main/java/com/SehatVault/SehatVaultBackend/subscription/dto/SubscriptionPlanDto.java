package com.SehatVault.SehatVaultBackend.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO for subscription plan data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanDto {
    
    private UUID subsId;
    private UUID hospitalId;
    private String hospitalName;
    private String subscriptionName;
    private BigDecimal amountPerMonth;
    private List<String> features;
    private Integer htTokens;
    private Boolean isActive;
}
