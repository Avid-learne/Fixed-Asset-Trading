package com.SehatVault.SehatVaultBackend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssetPricesDto {
    private double goldPricePerGram;
    private double silverPricePerGram;
}
