package com.SehatVault.SehatVaultBackend.wallet.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class DeductHtRequest {
    private UUID patientUserId;
    private BigDecimal amount;
    private String reason;

    /**
     * Optional source bucket: SUBSCRIPTION or ASSET.
     * If omitted, backend auto-selects based on available HT in patient cards.
     */
    private String source;
}
