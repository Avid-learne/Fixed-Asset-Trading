package com.SehatVault.SehatVaultBackend.blockchain.util;

import java.math.BigInteger;
import java.util.UUID;

public final class UuidUint256 {

    private UuidUint256() {
    }

    /**
     * Deterministically map a UUID into a uint256 by interpreting its 128-bit hex as an unsigned integer.
     */
    public static BigInteger toUint256(UUID uuid) {
        if (uuid == null) {
            return BigInteger.ZERO;
        }
        String hex = uuid.toString().replace("-", "");
        return new BigInteger(hex, 16);
    }
}
