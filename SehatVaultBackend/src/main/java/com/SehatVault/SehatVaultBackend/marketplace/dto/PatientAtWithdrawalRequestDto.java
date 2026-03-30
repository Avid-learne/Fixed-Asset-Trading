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
 * DTO for PatientAtWithdrawalRequest responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PatientAtWithdrawalRequestDto {
    private UUID requestId;
    private UUID patientId;
    private UUID assetId;
    private UUID tradeId;
    private UUID assignmentId;
    private LocalDateTime requestedAt;
    private String reason;
    private String requestStatus;
    private Integer tradeRemainingTimeDays;
    private LocalDateTime notifiedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime retrievedAt;
    private String hospitalNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
