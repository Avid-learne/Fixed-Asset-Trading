package com.SehatVault.SehatVaultBackend.blockchain.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Blockchain network configuration holder
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainNetworkConfig {
    private String networkUrl;
    private long chainId;
    
    /**
     * Network type enum for different blockchain networks
     */
    public enum NetworkType {
        HARDHAT_LOCAL("http://127.0.0.1:8545", 31337),
        SEPOLIA_TESTNET("https://sepolia.infura.io/v3/YOUR_INFURA_KEY", 11155111),
        ETHEREUM_MAINNET("https://mainnet.infura.io/v3/YOUR_INFURA_KEY", 1);

        private final String defaultUrl;
        private final long defaultChainId;

        NetworkType(String defaultUrl, long defaultChainId) {
            this.defaultUrl = defaultUrl;
            this.defaultChainId = defaultChainId;
        }

        public String getDefaultUrl() {
            return defaultUrl;
        }

        public long getDefaultChainId() {
            return defaultChainId;
        }
    }
}
