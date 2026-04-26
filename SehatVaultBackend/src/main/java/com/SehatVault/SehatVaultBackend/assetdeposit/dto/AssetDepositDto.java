package com.SehatVault.SehatVaultBackend.assetdeposit.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AssetDepositDto {
    private UUID assetId;
    private UUID patientId;
    private String patientName;
    private String patientEmail;
    private UUID hospitalId;
    private String hospitalName;
    private String assetType;
    private String assetReceipt;
    private String purityCertificate;
    private String supportingDocuments;
    private BigDecimal weight;
    private BigDecimal assetValue;
    private BigDecimal expectedTokens;
    private String status;
    private String bankApprovalStatus;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private String rejectionReason;
    private LocalDateTime bankApprovedAt;
    private LocalDateTime bankRejectedAt;
    private String bankRejectionReason;

    private String custodyStatus;
    private LocalDateTime custodyConfirmedAt;
    private BigDecimal baselineHtPerMonth;
    private LocalDateTime lastBaselineHtAt;
}
