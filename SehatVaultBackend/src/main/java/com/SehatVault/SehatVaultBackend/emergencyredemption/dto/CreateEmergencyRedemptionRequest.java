package com.SehatVault.SehatVaultBackend.emergencyredemption.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateEmergencyRedemptionRequest {
    private BigDecimal requestedAtAmount;
    private String patientReason;
    private String supportingDocuments;
    private Boolean tradeoffAcknowledged;
}
