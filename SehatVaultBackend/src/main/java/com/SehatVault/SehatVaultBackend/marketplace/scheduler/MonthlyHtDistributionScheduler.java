package com.SehatVault.SehatVaultBackend.marketplace.scheduler;

import com.SehatVault.SehatVaultBackend.marketplace.entity.MonthlyHtDistribution;
import com.SehatVault.SehatVaultBackend.marketplace.entity.TradeParticipation;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MonthlyHtDistributionRepository;
import com.SehatVault.SehatVaultBackend.marketplace.repository.TradeParticipationRepository;
import com.SehatVault.SehatVaultBackend.marketplace.service.AtTradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Legacy scheduler that credited monthly HT as 5% of AT monetary value while a
 * trade was active. Superseded by {@link TradeHtAllocationScheduler}, which
 * credits the basic subscription plan's monthly HT instead. Kept here for
 * reference; remove {@code @Component} so it does not run alongside the new
 * scheduler (would double-credit).
 */
// @Component  // disabled — replaced by TradeHtAllocationScheduler
@RequiredArgsConstructor
@Slf4j
public class MonthlyHtDistributionScheduler {

    private final AtTradingService atTradingService;
    private final TradeParticipationRepository tradeParticipationRepository;
    private final MonthlyHtDistributionRepository monthlyHtDistributionRepository;

    /**
     * Create monthly HT distributions for all active trade participations.
     * Runs on 1st day of each month at midnight (0 0 0 1 * *)
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void createMonthlyDistributions() {
        log.info("=== Starting monthly HT distribution creation task ===");

        try {
            LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
            log.info("Creating distributions for month: {}", currentMonth);

            // Get all active trade participations
            List<TradeParticipation> activeParticipations = tradeParticipationRepository.findAll()
                    .stream()
                    .filter(p -> p.getParticipationStatus() == TradeParticipation.ParticipationStatus.ACTIVE)
                    .toList();

            log.info("Found {} active participations for distribution", activeParticipations.size());

            int created = 0;
            for (TradeParticipation participation : activeParticipations) {
                try {
                    // Check if distribution already exists for this month
                    List<MonthlyHtDistribution> existing = monthlyHtDistributionRepository
                            .findDistributionsByPatientAndMonth(participation.getPatientId(), currentMonth);

                    if (existing.isEmpty()) {
                        // Create new distribution
                        MonthlyHtDistribution distribution = atTradingService.createMonthlyHtDistribution(
                                participation.getTradeId(),
                                participation.getParticipationId(),
                                participation.getPatientId(),
                                currentMonth);

                        log.debug("Monthly distribution created for participation {} with {} HT",
                                participation.getParticipationId(), distribution.getCalculatedHtAmount());
                        created++;
                    }
                } catch (Exception e) {
                    log.warn("Failed to create distribution for participation {}: {}",
                            participation.getParticipationId(), e.getMessage());
                }
            }

            log.info("=== Monthly HT distribution creation task completed - {} new distributions created ===", created);
        } catch (Exception e) {
            log.error("Fatal error in monthly HT distribution scheduler", e);
        }
    }

    /**
     * Distribute pending HT to patients (background task).
     * Runs daily at 2 AM to process pending distributions.
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void distributePendingHt() {
        log.info("=== Starting pending HT distribution task ===");

        try {
            // Get all pending distributions
            List<MonthlyHtDistribution> pendingDistributions = monthlyHtDistributionRepository.findAll()
                    .stream()
                    .filter(d -> !d.getIsDistributed())
                    .toList();

            log.info("Found {} pending HT distributions to process", pendingDistributions.size());

            int distributed = 0;
            for (MonthlyHtDistribution distribution : pendingDistributions) {
                try {
                    atTradingService.distributeMonthlyHt(distribution.getDistributionId());
                    log.debug("HT distribution {} distributed to patient {}",
                            distribution.getDistributionId(), distribution.getPatientId());
                    distributed++;
                } catch (Exception e) {
                    log.warn("Failed to distribute HT for distribution {}: {}",
                            distribution.getDistributionId(), e.getMessage());
                }
            }

            log.info("=== Pending HT distribution task completed - {} distributions processed ===", distributed);
        } catch (Exception e) {
            log.error("Fatal error in pending HT distribution scheduler", e);
        }
    }
}
