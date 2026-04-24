package com.SehatVault.SehatVaultBackend.wallet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Reads token prices from the `tokens` table.
 * 1 AT = token_price PKR (from tokens where token_symbol='AT')
 * 1 HT = token_price PKR (from tokens where token_symbol='HT')
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenPriceService {

    private final JdbcTemplate jdbcTemplate;

    private BigDecimal cachedAtPrice;
    private BigDecimal cachedHtPrice;

    public BigDecimal getAtPricePkr() {
        if (cachedAtPrice == null) {
            cachedAtPrice = fetchPrice("AT", new BigDecimal("100"));
            log.info("AT price loaded from DB: {} PKR", cachedAtPrice);
        }
        return cachedAtPrice;
    }

    public BigDecimal getHtPricePkr() {
        if (cachedHtPrice == null) {
            cachedHtPrice = fetchPrice("HT", new BigDecimal("100"));
            log.info("HT price loaded from DB: {} PKR", cachedHtPrice);
        }
        return cachedHtPrice;
    }

    /** Convert PKR amount to AT tokens */
    public BigDecimal pkrToAt(BigDecimal pkr) {
        return pkr.divide(getAtPricePkr(), 2, java.math.RoundingMode.HALF_UP);
    }

    /** Convert AT tokens to PKR */
    public BigDecimal atToPkr(BigDecimal at) {
        return at.multiply(getAtPricePkr());
    }

    /** Convert PKR amount to HT tokens */
    public BigDecimal pkrToHt(BigDecimal pkr) {
        return pkr.divide(getHtPricePkr(), 6, java.math.RoundingMode.HALF_UP);
    }

    /** Reload prices from DB (call if admin updates token prices) */
    public void refreshPrices() {
        cachedAtPrice = null;
        cachedHtPrice = null;
    }

    private BigDecimal fetchPrice(String symbol, BigDecimal defaultPrice) {
        try {
            BigDecimal price = jdbcTemplate.queryForObject(
                    "SELECT token_price FROM tokens WHERE UPPER(token_symbol) = UPPER(?) LIMIT 1",
                    BigDecimal.class, symbol);
            return price != null && price.compareTo(BigDecimal.ZERO) > 0 ? price : defaultPrice;
        } catch (Exception e) {
            log.warn("Could not fetch {} price from DB, using default {}: {}", symbol, defaultPrice, e.getMessage());
            return defaultPrice;
        }
    }
}
