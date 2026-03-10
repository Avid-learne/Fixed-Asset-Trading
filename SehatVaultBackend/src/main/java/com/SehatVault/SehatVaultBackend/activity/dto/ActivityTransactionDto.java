package com.SehatVault.SehatVaultBackend.activity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityTransactionDto {
    private String id;
    private String tokenType;
    private String createdAt;
    private String status;
    private BigDecimal amount;
    private String transactionHash;
    private String fromAddress;
    private String toAddress;
    private String source;
    private String transactionType;
    private Long blockNumber;
}
