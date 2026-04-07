package com.SehatVault.SehatVaultBackend.subscription.scheduler;

import com.SehatVault.SehatVaultBackend.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionMonthlyAllocationScheduler {

    private final SubscriptionService subscriptionService;

    /**
     * Processes due monthly HT allocations for active subscriptions.
     * Runs every day at 01:00 to catch due subscriptions reliably.
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void processMonthlySubscriptionAllocations() {
        try {
            int allocations = subscriptionService.processMonthlySubscriptionAllocations();
            if (allocations > 0) {
                log.info("Processed {} monthly subscription HT allocation(s)", allocations);
            }
        } catch (Exception ex) {
            log.error("Failed to process monthly subscription HT allocations", ex);
        }
    }
}
