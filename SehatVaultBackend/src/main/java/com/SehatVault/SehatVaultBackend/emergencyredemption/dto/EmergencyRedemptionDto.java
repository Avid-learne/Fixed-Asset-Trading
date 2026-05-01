package com.SehatVault.SehatVaultBackend.emergencyredemption.dto;

import com.SehatVault.SehatVaultBackend.emergencyredemption.entity.EmergencyRedemptionRequest;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class EmergencyRedemptionDto {
    private UUID requestId;
    private UUID patientId;
    private UUID patientUserId;
    private UUID hospitalId;
    private UUID assetId;

    private EmergencyRedemptionRequest.Status status;

    private BigDecimal requestedAtAmount;
    private String patientReason;
    private String supportingDocuments;
    private Boolean tradeoffAcknowledged;

    private UUID reviewedBy;
    private LocalDateTime reviewedAt;
    private EmergencyRedemptionRequest.UrgencyLevel urgencyLevel;

    private BigDecimal approvedAtAmount;
    private BigDecimal conversionRate;
    private BigDecimal htIssued;
    private String staffJustification;
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
