package com.SehatVault.SehatVaultBackend.blockchain.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
@EnableConfigurationProperties(BlockchainProperties.class)
public class BlockchainConfig {

    @Bean
    public Web3j web3j(BlockchainProperties props) {
        return Web3j.build(new HttpService(props.getRpcUrl()));
    }
}
