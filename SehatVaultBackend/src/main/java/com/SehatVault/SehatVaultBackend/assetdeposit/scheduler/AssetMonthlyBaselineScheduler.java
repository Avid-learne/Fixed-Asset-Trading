package com.SehatVault.SehatVaultBackend.assetdeposit.scheduler;

import com.SehatVault.SehatVaultBackend.assetdeposit.service.AssetDepositService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AssetMonthlyBaselineScheduler {

    private final AssetDepositService assetDepositService;

    /**
     * Credits due monthly baseline HT for custody-confirmed assets.
     * Runs daily at 01:15.
     */
    @Scheduled(cron = "0 15 1 * * *")
    public void processAssetMonthlyBaselines() {
        try {
            int credits = assetDepositService.processMonthlyAssetBaselines();
            if (credits > 0) {
                log.info("Processed {} asset baseline HT credit(s)", credits);
            }
        } catch (Exception ex) {
            log.error("Failed to process asset baseline HT credits", ex);
        }
    }
}
