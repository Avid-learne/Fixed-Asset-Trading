package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderBookDto {
    private List<OrderBookLevelDto> bids;
    private List<OrderBookLevelDto> asks;
    private BigDecimal spread;
}
