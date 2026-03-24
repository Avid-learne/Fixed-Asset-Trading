package com.SehatVault.SehatVaultBackend.blockchain.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.FastRawTransactionManager;
import org.web3j.tx.TransactionManager;

/**
 * Web3j Configuration for Smart Contract Integration
 * Configures connection to Ethereum/blockchain network
 */
@Configuration
public class Web3Config {

    @Value("${blockchain.network.url:http://127.0.0.1:8545}")
    private String networkUrl;

    @Value("${blockchain.network.chain-id:31337}")
    private long chainId;

    @Value("${blockchain.wallet.private-key:}")
    private String walletPrivateKey;

    /**
     * Initialize Web3j client for blockchain communication
     * Connects to local Hardhat network or public blockchain
     */
    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(networkUrl));
    }

    /**
     * Transaction manager for sending transactions from hospital wallet
     * Uses FastRawTransactionManager for non-nonce-locking behavior
     */
    @Bean(name = "web3TransactionManager")
    public TransactionManager web3TransactionManager(Web3j web3j) {
        if (walletPrivateKey == null || walletPrivateKey.isEmpty()) {
            throw new IllegalArgumentException(
                "blockchain.wallet.private-key must be configured for contract interactions"
            );
        }
        
        return new FastRawTransactionManager(
            web3j,
            org.web3j.crypto.Credentials.create(walletPrivateKey),
            chainId
        );
    }

    /**
     * Network configuration accessor bean
     */
    @Bean
    public BlockchainNetworkConfig blockchainNetworkConfig() {
        return BlockchainNetworkConfig.builder()
            .networkUrl(networkUrl)
            .chainId(chainId)
            .build();
    }
}
