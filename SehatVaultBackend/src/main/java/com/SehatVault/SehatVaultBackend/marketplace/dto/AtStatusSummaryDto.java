package com.SehatVault.SehatVaultBackend.marketplace.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO for AT Status Summary response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AtStatusSummaryDto {
    private UUID patientId;
    private BigDecimal totalAvailableAt;
    private BigDecimal totalUnavailableAt;
    private BigDecimal totalAt;
    private BigDecimal pendingMonthlyHtAmount;
    private int activeTradeCount;
    private List<PatientAtWithdrawalRequestDto> activeWithdrawalRequests;
}
