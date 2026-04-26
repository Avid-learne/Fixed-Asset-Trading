package com.SehatVault.SehatVaultBackend.fractionalization.scheduler;

import com.SehatVault.SehatVaultBackend.fractionalization.service.FractionalizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FractionalizationNocExpiryScheduler {

    private final FractionalizationService fractionalizationService;

    /**
     * Runs daily at 01:30 to freeze expired NOC allocations and return unspent HT.
     */
    @Scheduled(cron = "0 30 1 * * *")
    public void processExpiredAllocations() {
        try {
            int processed = fractionalizationService.expireNocAllocations();
            if (processed > 0) {
                log.info("Processed {} expired fractional allocations", processed);
            }
        } catch (Exception e) {
            log.error("Failed processing expired fractional allocations", e);
        }
    }
}
