package com.SehatVault.SehatVaultBackend.blockchain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainTxRef {
    private String transactionHash;
    private Long blockNumber;
}
