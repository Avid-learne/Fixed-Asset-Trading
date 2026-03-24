package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class TradingSimulationService {

    private static final BigDecimal MAX_DELTA_PERCENT = new BigDecimal("0.12");
    private static final BigDecimal MIN_DELTA_PERCENT = new BigDecimal("0.01");

    private final SecureRandom random = new SecureRandom();

    public SimulationResult simulate(
        BigDecimal openingPrice,
        BigDecimal quantity,
        MarketplaceTrade.TradeType tradeType
    ) {
        BigDecimal safeOpening = nz(openingPrice);
        BigDecimal safeQuantity = nz(quantity);

        BigDecimal deltaPercent = MIN_DELTA_PERCENT
            .add(MAX_DELTA_PERCENT.subtract(MIN_DELTA_PERCENT)
                .multiply(BigDecimal.valueOf(random.nextDouble())));

        boolean favorable = random.nextBoolean();
        if (tradeType == MarketplaceTrade.TradeType.SELL) {
            favorable = !favorable;
        }

        BigDecimal movement = safeOpening.multiply(deltaPercent).setScale(6, RoundingMode.HALF_UP);
        BigDecimal closingPrice = favorable
            ? safeOpening.add(movement)
            : safeOpening.subtract(movement);

        if (closingPrice.compareTo(BigDecimal.ZERO) <= 0) {
            closingPrice = safeOpening;
        }

        BigDecimal high = safeOpening.max(closingPrice)
            .multiply(new BigDecimal("1.01"))
            .setScale(6, RoundingMode.HALF_UP);
        BigDecimal low = safeOpening.min(closingPrice)
            .multiply(new BigDecimal("0.99"))
            .setScale(6, RoundingMode.HALF_UP);

        BigDecimal amountBefore = safeOpening.multiply(safeQuantity).setScale(6, RoundingMode.HALF_UP);
        BigDecimal amountAfter = closingPrice.multiply(safeQuantity).setScale(6, RoundingMode.HALF_UP);

        long blockNumber = Math.abs(random.nextLong(9_000_000L)) + 1_000_000L;
        String txHash = "SIM-" + Long.toHexString(Math.abs(random.nextLong()));

        LocalDateTime now = LocalDateTime.now();
        return new SimulationResult(
            safeOpening,
            closingPrice,
            high,
            low,
            safeQuantity,
            amountBefore,
            amountAfter,
            amountAfter.subtract(amountBefore),
            now.minusMinutes(5),
            now,
            blockNumber,
            txHash
        );
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    public record SimulationResult(
        BigDecimal openingPrice,
        BigDecimal closingPrice,
        BigDecimal high,
        BigDecimal low,
        BigDecimal volume,
        BigDecimal amountBeforeTrade,
        BigDecimal amountAfterTrade,
        BigDecimal profitLoss,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Long blockNumber,
        String transactionHash
    ) {}
}
