package com.SehatVault.SehatVaultBackend.emergencyredemption.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ApproveEmergencyRedemptionRequest {
    private String urgencyLevel; // ROUTINE | MODERATE | CRITICAL
    private BigDecimal atToConvert;
    private BigDecimal conversionRate; // HT per AT
    private String staffJustification;
}
