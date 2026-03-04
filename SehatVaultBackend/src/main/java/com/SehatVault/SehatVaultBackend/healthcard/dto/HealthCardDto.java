package com.SehatVault.SehatVaultBackend.healthcard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for Health Card responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthCardDto {
    private String cardId;
    private String patientId;
    private String cardNumber;
    private String cardType; // SUBSCRIPTION or ASSET
    private String holderName;
    private String planName;
    private BigDecimal assetValue;
    private BigDecimal htBalance;
    private String validUntil;
    private String issueDate;
    private String status; // ACTIVE, EXPIRED, SUSPENDED, CANCELLED
    private String cvv;
    private String securityKey;
    private String subscriptionId;
}
