package com.SehatVault.SehatVaultBackend.blockchain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

/**
 * Response DTO for token minting operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainMintResponse {
    private String transactionHash;     // Blockchain transaction hash
    private String contractAddress;     // Contract that executed mint
    private String tokenType;           // "AT" or "HT"
    private BigInteger amount;          // Amount minted
    private String patientAddress;      // Recipient wallet address
    private Long depositId;             // For AT mints - asset deposit reference
    private String status;              // "PENDING" or "CONFIRMED"
    private String blockNumber;         // Block containing transaction
    private String gasUsed;             // Gas used for transaction
    private Long timestamp;             // Transaction timestamp
}
