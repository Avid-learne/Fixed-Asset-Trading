package com.SehatVault.SehatVaultBackend.blockchain.util;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;

public final class TokenUnitConverter {

    private TokenUnitConverter() {
    }

    public static BigInteger toBaseUnits(BigDecimal amount, int decimals) {
        if (amount == null) {
            return BigInteger.ZERO;
        }
        if (decimals < 0) {
            throw new IllegalArgumentException("decimals must be >= 0");
        }
        BigDecimal scaled = amount.multiply(BigDecimal.TEN.pow(decimals));
        // Always round DOWN to preserve existing off-chain rules (never mint more than computed).
        scaled = scaled.setScale(0, RoundingMode.DOWN);
        return scaled.toBigIntegerExact();
    }
}
