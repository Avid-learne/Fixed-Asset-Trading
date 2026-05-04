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
    /** Current AT in the Pool 1 (WITH_PATIENT) assignment for this asset, after any redemptions. */
    private BigDecimal currentPool1At;
    /** Current PKR backing value of the AT remaining in Pool 1 = currentPool1At * AT price. */
    private BigDecimal currentPool1ValuePkr;
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

    /** Total AT actually minted for this asset so far (sum of all MintRecord rows).
     *  0 means custody-confirmed but not yet minted by hospital admin. */
    private BigDecimal tokensMinted;
    private Boolean minted;
}
