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

    // Convenience fields
    private BigDecimal monetaryValuePkr;
    private BigDecimal availableMonetaryValuePkr;
    private BigDecimal unavailableMonetaryValuePkr;
}
