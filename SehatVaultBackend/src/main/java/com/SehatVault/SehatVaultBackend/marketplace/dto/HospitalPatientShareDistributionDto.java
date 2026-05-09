package com.SehatVault.SehatVaultBackend.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Hospital staff/admin view: patient-share profit distribution rows for AT trading.
 * Each row represents a monthly HT distribution entry for a trade participation,
 * augmented with patient identity and AT allocation context.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalPatientShareDistributionDto {

    private UUID distributionId;
    private UUID tradeId;
    private UUID participationId;

    private UUID patientId;
    private String patientRegistrationId;
    private String patientName;
    private String patientCnic;

    // AT context (tokens allocated to the trade)
    private BigDecimal atAllocated;
    private LocalDateTime atAllocatedAt;

    // HT distribution (patient share) for the month
    private BigDecimal htAmount;
    private LocalDate distributionMonth;

    private Boolean isDistributed;
    private LocalDateTime htDistributedAt;

    private LocalDateTime createdAt;
}
