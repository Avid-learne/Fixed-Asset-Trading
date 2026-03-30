package com.SehatVault.SehatVaultBackend.marketplace.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for TradeParticipation responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TradeParticipationDto {
    private UUID participationId;
    private UUID tradeId;
    private UUID patientId;
    private UUID assetId;
    private UUID assignmentId;
    private BigDecimal atAllocated;
    private BigDecimal atMonetaryValuePkr;
    private String participationStatus;
    private LocalDateTime tradeStartTime;
    private LocalDateTime tradeEndTime;
    private LocalDateTime markedUnavailableAt;
    private BigDecimal monthlyHtAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
