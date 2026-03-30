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
 * DTO for PatientAtAssignment responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientAtAssignmentDto {
    private UUID assignmentId;
    private UUID patientId;
    private UUID assetId;
    private UUID hospitalId;
    private BigDecimal totalAtAssigned;
    private BigDecimal availableAt;
    private BigDecimal unavailableAt;
    private String availabilityStatus;
    private BigDecimal monetaryValue;
    private BigDecimal availableMonetaryValue;
    private BigDecimal unavailableMonetaryValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
