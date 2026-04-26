package com.SehatVault.SehatVaultBackend.fractionalization.entity;

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
@Table(name = "fractionalization_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FractionalizationRequest {

    public enum Status {
        PENDING_ADMIN,
        PENDING_INSURER,
        REJECTED,
        ACTIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "primary_patient_id", nullable = false)
    private UUID primaryPatientId;

    @Column(name = "primary_patient_user_id", nullable = false)
    private UUID primaryPatientUserId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    /** SUBSCRIPTION | ASSET */
    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "fractionalize_ht_amount", nullable = false, precision = 18, scale = 6)
    private BigDecimal fractionalizeHtAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.PENDING_ADMIN;

    @Column(name = "patient_note", columnDefinition = "text")
    private String patientNote;

    // Admin / Insurance NOC details (required to activate)
    @Column(name = "noc_number")
    private String nocNumber;

    @Column(name = "insurer_name")
    private String insurerName;

    @Column(name = "noc_issued_at")
    private LocalDateTime nocIssuedAt;

    @Column(name = "noc_expires_at")
    private LocalDateTime nocExpiresAt;

    @Column(name = "noc_document")
    private String nocDocument;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "rejection_reason", columnDefinition = "text")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
