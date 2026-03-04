package com.SehatVault.SehatVaultBackend.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response DTO for patient subscription data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientSubscriptionDto {
    
    private UUID subsReqId;
    private UUID subscriptionId;
    private String subscriptionName;
    private BigDecimal amount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Integer htTokens;
}
