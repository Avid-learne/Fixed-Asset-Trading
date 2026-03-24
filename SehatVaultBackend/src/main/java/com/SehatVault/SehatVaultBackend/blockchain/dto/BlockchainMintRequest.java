package com.SehatVault.SehatVaultBackend.blockchain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

/**
 * Request DTO for minting tokens on blockchain
 * Used for both AT (Asset Token) and HT (Health Token) minting
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainMintRequest {
    private String patientAddress;      // Wallet address of patient
    private BigInteger amount;          // Amount of tokens to mint
    private String tokenType;           // "AT" or "HT"
    private Long depositId;             // For AT mints - asset deposit reference
    private String metadata;            // Optional IPFS hash or metadata
}
