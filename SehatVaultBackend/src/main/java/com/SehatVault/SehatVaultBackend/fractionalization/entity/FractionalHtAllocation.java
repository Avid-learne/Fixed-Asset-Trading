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
@Table(name = "fractional_ht_allocations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FractionalHtAllocation {

    public enum Status {
        ACTIVE,
        FROZEN,
        REVOKED,
        EXPIRED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "allocation_id")
    private UUID allocationId;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Column(name = "primary_patient_id", nullable = false)
    private UUID primaryPatientId;

    @Column(name = "primary_user_id", nullable = false)
    private UUID primaryUserId;

    @Column(name = "beneficiary_patient_id", nullable = false)
    private UUID beneficiaryPatientId;

    @Column(name = "beneficiary_user_id", nullable = false)
    private UUID beneficiaryUserId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    /** SUBSCRIPTION | ASSET */
    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "total_allocated_ht", nullable = false, precision = 18, scale = 6)
    private BigDecimal totalAllocatedHt;

    @Column(name = "remaining_ht", nullable = false, precision = 18, scale = 6)
    private BigDecimal remainingHt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.ACTIVE;

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

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
