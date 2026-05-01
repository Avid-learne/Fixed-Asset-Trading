package com.SehatVault.SehatVaultBackend.emergencyredemption.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "emergency_redemption_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyRedemptionRequest {

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }

    public enum UrgencyLevel {
        ROUTINE,
        MODERATE,
        CRITICAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "patient_user_id", nullable = false)
    private UUID patientUserId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    /** The Pool 1 asset (assetId / depositId) this redemption targets. */
    @Column(name = "asset_id")
    private UUID assetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.PENDING;

    @Column(name = "requested_at_amount", nullable = false, precision = 18, scale = 6)
    private BigDecimal requestedAtAmount;

    @Column(name = "patient_reason", columnDefinition = "text")
    private String patientReason;

    @Column(name = "supporting_documents", columnDefinition = "text")
    private String supportingDocuments;

    @Column(name = "tradeoff_acknowledged", nullable = false)
    private Boolean tradeoffAcknowledged = false;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level")
    private UrgencyLevel urgencyLevel;

    @Column(name = "approved_at_amount", precision = 18, scale = 6)
    private BigDecimal approvedAtAmount;

    /** HT per AT */
    @Column(name = "conversion_rate", precision = 18, scale = 6)
    private BigDecimal conversionRate;

    @Column(name = "ht_issued", precision = 18, scale = 6)
    private BigDecimal htIssued;

    @Column(name = "staff_justification", columnDefinition = "text")
    private String staffJustification;

    @Column(name = "rejection_reason", columnDefinition = "text")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
