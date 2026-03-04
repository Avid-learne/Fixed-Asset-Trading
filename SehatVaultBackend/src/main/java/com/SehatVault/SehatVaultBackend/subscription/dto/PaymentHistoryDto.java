package com.SehatVault.SehatVaultBackend.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for payment history records
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryDto {
    
    private UUID paymentId;
    private UUID patientId;
    private UUID subsId;
    private String subscriptionName;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private String invoiceUrl;
    private LocalDateTime timestamp;
}
