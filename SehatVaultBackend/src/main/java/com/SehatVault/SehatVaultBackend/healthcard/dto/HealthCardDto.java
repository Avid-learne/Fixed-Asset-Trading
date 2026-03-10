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
    private String patientCardId;
    private String patientId;
    private String cardId;
    private String cardName;
    private String cardNum;
    private BigDecimal htBalance;
    private String expiryDate;
    private String cvv;
}
