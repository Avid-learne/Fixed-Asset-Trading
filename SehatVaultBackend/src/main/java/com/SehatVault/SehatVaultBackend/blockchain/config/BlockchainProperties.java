package com.SehatVault.SehatVaultBackend.blockchain.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigInteger;

@Data
@ConfigurationProperties(prefix = "blockchain")
public class BlockchainProperties {
    private boolean enabled = true;
    private String rpcUrl = "http://127.0.0.1:8545";
    private long chainId = 31337L;

    private Wallet wallet = new Wallet();
    private Contracts contracts = new Contracts();
    private Gas gas = new Gas();

    @Data
    public static class Wallet {
        private String address;
        private String privateKey;
    }

    @Data
    public static class Contracts {
        private String assetToken;
        private String healthToken;
        private String hospitalFinancials;
    }

    @Data
    public static class Gas {
        private BigInteger price = BigInteger.valueOf(1_000_000_000L);
        private BigInteger limit = BigInteger.valueOf(6_000_000L);
    }
}
