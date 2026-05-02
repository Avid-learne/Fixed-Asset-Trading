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
    /** Mirrors PatientAtAssignment.availabilityStatus (WITH_PATIENT / AVAILABLE / UNAVAILABLE).
     *  The trade-creation picker uses this to exclude UNAVAILABLE (already locked in a live trade). */
    private String availabilityStatus;
    /** True iff the patient has blocked this asset from trading. Pool Management UI uses
     *  this to disable the "Move to Trading Pool" button so the admin sees the blocker
     *  instead of clicking and getting a backend error. */
    private Boolean tradingOptOut;
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
