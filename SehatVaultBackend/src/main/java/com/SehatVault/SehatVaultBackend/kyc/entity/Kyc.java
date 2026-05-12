package com.SehatVault.SehatVaultBackend.kyc.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * KYC (Know Your Customer) Submission Entity
 * Tracks KYC submissions and their verification status
 */
@Entity
@Table(name = "kyc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Kyc {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "kyc_id")
    private UUID kycId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "completion_percentage")
    private Integer completionPercentage = 0;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private KycStatus status = KycStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum KycStatus {
        PENDING, IN_PROGRESS, APPROVED, REJECTED
    }
}
