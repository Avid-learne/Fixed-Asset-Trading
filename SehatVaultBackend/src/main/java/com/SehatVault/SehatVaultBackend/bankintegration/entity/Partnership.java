package com.SehatVault.SehatVaultBackend.bankintegration.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "partnerships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Partnership {

    @Id
    @Column(name = "partnership_id")
    private UUID partnershipId;

    @Column(name = "bank_id", nullable = false)
    private UUID bankId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "partnership_started", nullable = false)
    private LocalDate partnershipStarted;

    @Column(name = "assets_deposited_to_bank")
    private BigDecimal assetsDepositedToBank = BigDecimal.ZERO;

    @Column(name = "loans_taken_by_hospital")
    private BigDecimal loansTakenByHospital = BigDecimal.ZERO;

    @Column(name = "total_deposits")
    private BigDecimal totalDeposits = BigDecimal.ZERO;

    @Column(name = "contact_person_id")
    private UUID contactPersonId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "integration_status")
    private IntegrationStatus integrationStatus = IntegrationStatus.PENDING;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @PrePersist
    protected void onCreate() {
        if (partnershipId == null) {
            partnershipId = UUID.randomUUID();
        }
        if (partnershipStarted == null) {
            partnershipStarted = LocalDate.now();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (assetsDepositedToBank == null) {
            assetsDepositedToBank = BigDecimal.ZERO;
        }
        if (loansTakenByHospital == null) {
            loansTakenByHospital = BigDecimal.ZERO;
        }
        if (totalDeposits == null) {
            totalDeposits = BigDecimal.ZERO;
        }
        if (integrationStatus == null) {
            integrationStatus = IntegrationStatus.PENDING;
        }
    }

    public enum IntegrationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
