package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderBookLevelDto {
    private BigDecimal price;
    private BigDecimal volume;
    private BigDecimal total;
    private String type;
}
