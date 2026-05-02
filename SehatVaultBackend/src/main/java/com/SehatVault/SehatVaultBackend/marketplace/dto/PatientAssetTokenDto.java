package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for displaying patient's linked asset tokens with availability status
 * Combines AssetDeposit and PatientAtAssignment information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAssetTokenDto {

    // Asset Deposit Info
    private UUID assetId;
    private String assetType;
    private BigDecimal assetValue;
    private BigDecimal weight;
    private String depositStatus;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;

    // AT Assignment Info
    private UUID assignmentId;
    private UUID hospitalId;
    private BigDecimal totalAtAssigned;
    private BigDecimal availableAt;
    private BigDecimal unavailableAt;
    private String availabilityStatus;
    private LocalDateTime assignedAt;

    /** True iff the patient has opted this asset out of trading. While true, the asset
     *  cannot be moved into Pool 2 and will not be selected for any new trade — even if
     *  it is currently locked in a live trade, it returns to Pool 1 only when that trade
     *  closes and stays there until the patient flips this flag back. */
    private Boolean tradingOptOut;

    // Convenience fields
    private BigDecimal monetaryValuePkr;
    private BigDecimal availableMonetaryValuePkr;
    private BigDecimal unavailableMonetaryValuePkr;
}
