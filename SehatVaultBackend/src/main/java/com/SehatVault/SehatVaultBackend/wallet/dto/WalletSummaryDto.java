package com.SehatVault.SehatVaultBackend.wallet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletSummaryDto {
    private String userId;
    private String patientId;
    private String walletAddress;
    private BigDecimal totalAt;
    private BigDecimal totalHt;
}
