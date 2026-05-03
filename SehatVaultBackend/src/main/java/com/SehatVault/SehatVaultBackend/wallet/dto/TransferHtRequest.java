package com.SehatVault.SehatVaultBackend.wallet.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransferHtRequest {
    private String recipientWalletAddress;
    private BigDecimal amount;
    private String note;
    private String transactionHash;
}
