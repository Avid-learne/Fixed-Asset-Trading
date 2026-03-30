package com.SehatVault.SehatVaultBackend.marketplace.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for MonthlyHtDistribution responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MonthlyHtDistributionDto {
    private UUID distributionId;
    private UUID tradeId;
    private UUID participationId;
    private UUID patientId;
    private LocalDate distributionMonth;
    private BigDecimal atPercentageRate;
    private BigDecimal atAmountBase;
    private BigDecimal calculatedHtAmount;
    private Boolean isDistributed;
    private LocalDateTime distributedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
