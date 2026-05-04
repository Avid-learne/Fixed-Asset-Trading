package com.SehatVault.SehatVaultBackend.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * Request DTO for subscribing to a plan
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscribeRequest {
    
    private UUID userId;
    private UUID subscriptionId;
    private String paymentMethod;
    private String cardNumber;
    private String expiryDate;
    private String cvv;
}
