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
 * Per-patient breakdown for a single trade — who funded it and how much of
 * their asset was used. Surfaced to the hospital admin marketplace UI so the
 * admin can see all owners behind a trade at a glance.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TradeParticipantDetailDto {
    private UUID participationId;
    private UUID patientId;
    private String patientName;
    private String patientRegistrationId;
    private UUID assetId;
    private String assetType;
    private BigDecimal assetValue;
    private BigDecimal atAllocated;
    private BigDecimal atMonetaryValuePkr;
    private String participationStatus;
    private LocalDateTime tradeStartTime;
    private LocalDateTime tradeEndTime;
}
