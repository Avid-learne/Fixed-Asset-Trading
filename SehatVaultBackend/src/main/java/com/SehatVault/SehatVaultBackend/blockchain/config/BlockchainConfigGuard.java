package com.SehatVault.SehatVaultBackend.blockchain.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Startup audit for the blockchain config. When blockchain.enabled=true, every field that
 * on-chain write paths depend on (signer key + contract addresses) must be set. Anything
 * missing is logged loudly so the operator sees it on boot — actual on-chain calls then
 * fail fast in {@link com.SehatVault.SehatVaultBackend.blockchain.service.BlockchainWriteService}
 * with a specific message naming the missing property.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BlockchainConfigGuard {

    private final BlockchainProperties props;

    @EventListener(ApplicationReadyEvent.class)
    public void verifyConfig() {
        if (!props.isEnabled()) {
            log.info("Blockchain integration is DISABLED (blockchain.enabled=false). On-chain calls will be skipped.");
            return;
        }

        List<String> missing = new ArrayList<>();
        if (isBlank(props.getRpcUrl())) {
            missing.add("blockchain.rpc-url");
        }
        if (props.getWallet() == null || isBlank(props.getWallet().getPrivateKey())) {
            missing.add("blockchain.wallet.private-key");
        }
        if (props.getContracts() == null || isBlank(props.getContracts().getAssetToken())) {
            missing.add("blockchain.contracts.asset-token");
        }
        if (props.getContracts() == null || isBlank(props.getContracts().getHealthToken())) {
            missing.add("blockchain.contracts.health-token");
        }
        if (props.getContracts() == null || isBlank(props.getContracts().getHospitalFinancials())) {
            missing.add("blockchain.contracts.hospital-financials");
        }

        if (missing.isEmpty()) {
            log.info("Blockchain integration ENABLED — chainId={}, rpc={}, contracts wired.",
                    props.getChainId(), props.getRpcUrl());
            return;
        }

        log.warn("Blockchain integration is ENABLED but the following properties are missing: {}", missing);
        log.warn("Endpoints that need on-chain writes will fail with a clear error. "
                + "Set the missing properties or set blockchain.enabled=false to run without on-chain writes.");
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
