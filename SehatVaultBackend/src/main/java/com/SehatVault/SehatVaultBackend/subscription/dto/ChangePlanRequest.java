package com.SehatVault.SehatVaultBackend.subscription.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class ChangePlanRequest {
    private UUID userId;
    private UUID newSubscriptionId;
    private String paymentMethod;
    private String cardNumber;
    private String expiryDate;
    private String cvv;
}
