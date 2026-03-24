package com.SehatVault.SehatVaultBackend.blockchain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

/**
 * Response DTO for trade recording operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainTradeResponse {
    private String transactionHash;     // Blockchain transaction hash
    private String contractAddress;     // HospitalFinancials contract address
    private BigInteger investedAT;      // AT invested
    private BigInteger profitEarned;    // Profit from trade
    private String status;              // "PENDING" or "CONFIRMED"
    private String tradeId;             // On-chain trade ID
    private String blockNumber;         // Block containing transaction
    private Long timestamp;             // Transaction timestamp
}
