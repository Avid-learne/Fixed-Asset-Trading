package com.SehatVault.SehatVaultBackend.wallet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransactionDto {
    private String transactionId;
    private String tokenSymbol;
    private String transactionType;
    private BigDecimal amount;
    private String description;
    private String senderWalletAddress;
    private String receiverWalletAddress;
    private Long blockNumber;
    private String transactionHash;
    private String status;
    private String timestamp;
}
