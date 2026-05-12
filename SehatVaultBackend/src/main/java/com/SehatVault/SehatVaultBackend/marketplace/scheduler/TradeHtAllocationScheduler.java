package com.SehatVault.SehatVaultBackend.marketplace.scheduler;

import com.SehatVault.SehatVaultBackend.marketplace.service.TradeHtAllocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Daily job that credits monthly HT to patients whose AT is locked in an
 * ACTIVE trade. Once the trade settles or the patient withdraws, the
 * participation status changes and allocations stop automatically.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TradeHtAllocationScheduler {

    private final TradeHtAllocationService tradeHtAllocationService;

    @Scheduled(cron = "0 30 2 * * *")
    public void processDueAllocations() {
        try {
            int allocations = tradeHtAllocationService.processDueAllocations();
            if (allocations > 0) {
                log.info("Credited {} trade-lock monthly HT allocation(s)", allocations);
            }
        } catch (Exception ex) {
            log.error("Failed to process trade-lock monthly HT allocations", ex);
        }
    }
}
