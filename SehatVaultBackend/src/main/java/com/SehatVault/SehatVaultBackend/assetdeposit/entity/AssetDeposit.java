package com.SehatVault.SehatVaultBackend.assetdeposit.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "asset_deposits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssetDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "bank_id")
    private UUID bankId;

    @Column(name = "asset_type", nullable = false)
    private String assetType;

    @Column(name = "asset_value", nullable = false)
    private BigDecimal assetValue;

    @Column(name = "asset_receipt")
    private String assetReceipt;

    @Column(name = "purity_certificate")
    private String purityCertificate;

    @Column(name = "supporting_documents")
    private String supportingDocuments;

    @Column(name = "weight")
    private BigDecimal weight;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "bank_approval_status")
    private String bankApprovalStatus;

    @Column(name = "bank_approved_at")
    private LocalDateTime bankApprovedAt;

    @Column(name = "bank_rejected_at")
    private LocalDateTime bankRejectedAt;

    @Column(name = "bank_rejection_reason")
    private String bankRejectionReason;

    // Physical custody confirmation (bank receives the asset in real life)
    @Column(name = "custody_status")
    private String custodyStatus;

    @Column(name = "custody_confirmed_at")
    private LocalDateTime custodyConfirmedAt;

    @Column(name = "custody_confirmed_by")
    private UUID custodyConfirmedBy;

    // Baseline monthly HT benefit while asset remains on deposit
    @Column(name = "baseline_ht_per_month")
    private BigDecimal baselineHtPerMonth;

    @Column(name = "last_baseline_ht_at")
    private LocalDateTime lastBaselineHtAt;

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "pending";
        }
    }
}
