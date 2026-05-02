package com.SehatVault.SehatVaultBackend.marketplace.scheduler;

import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import com.SehatVault.SehatVaultBackend.marketplace.entity.TradeParticipation;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
import com.SehatVault.SehatVaultBackend.marketplace.repository.TradeParticipationRepository;
import com.SehatVault.SehatVaultBackend.marketplace.service.AtTradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * On application startup, scans for CLOSED trades that still have ACTIVE participations
 * and retroactively settles them. Cleans up trades closed under older code that didn't
 * call settleTrade.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StuckTradeSettler {

    private final MarketplaceTradeRepository marketplaceTradeRepository;
    private final TradeParticipationRepository tradeParticipationRepository;
    private final AtTradingService atTradingService;

    @EventListener(ApplicationReadyEvent.class)
    public void settleStuckTrades() {
        try {
            List<MarketplaceTrade> closed = marketplaceTradeRepository.findAll().stream()
                    .filter(t -> t.getStatus() == MarketplaceTrade.TradeStatus.CLOSED)
                    .toList();

            int settled = 0;
            for (MarketplaceTrade trade : closed) {
                List<TradeParticipation> stuck = tradeParticipationRepository
                        .findActiveParticipationsByTradeId(trade.getTradeId());
                if (stuck.isEmpty()) continue;

                BigDecimal pl = trade.getProfitLoss() == null ? BigDecimal.ZERO : trade.getProfitLoss();
                try {
                    atTradingService.settleTrade(trade.getTradeId(), pl);
                    settled++;
                    log.info("Auto-settled stuck CLOSED trade {} ({} participations) profitLoss={}",
                            trade.getTradeId(), stuck.size(), pl);
                } catch (Exception ex) {
                    log.error("Failed to auto-settle stuck trade {}: {}", trade.getTradeId(), ex.getMessage(), ex);
                }
            }

            if (settled > 0) {
                log.info("StuckTradeSettler: settled {} stuck CLOSED trade(s) on startup", settled);
            }
        } catch (Exception ex) {
            log.error("StuckTradeSettler failed: {}", ex.getMessage(), ex);
        }
    }
}
