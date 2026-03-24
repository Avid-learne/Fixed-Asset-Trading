package com.SehatVault.SehatVaultBackend.blockchain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

/**
 * Request DTO for recording trades on blockchain
 * Submitted when a marketplace trade is executed
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainTradeRequest {
    private BigInteger investedAT;      // Amount of AT invested in trade
    private BigInteger profitEarned;    // Profit generated from trade
    private String tradeReference;      // Internal trade ID reference
    private String hospitalId;          // Hospital identifier
}
