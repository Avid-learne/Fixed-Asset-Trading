package com.SehatVault.SehatVaultBackend.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * PatientAtWithdrawalRequest entity - Tracks requests from patients to withdraw
 * their AT.
 * Mapped to patient_at_withdrawal_requests table.
 */
@Entity
@Table(name = "patient_at_withdrawal_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAtWithdrawalRequest {

    public enum WithdrawalRequestStatus {
        PENDING, // Request submitted, awaiting approval
        APPROVED, // Request approved, waiting for trade to end
        RETRIEVED, // AT have been returned to patient
        CANCELLED // Request cancelled by patient or hospital
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "trade_id", nullable = false)
    private UUID tradeId;

    @Column(name = "assignment_id", nullable = false)
    private UUID assignmentId;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "reason")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_status", nullable = false)
    @lombok.Builder.Default
    private WithdrawalRequestStatus requestStatus = WithdrawalRequestStatus.PENDING;

    @Column(name = "trade_remaining_time_days")
    private Integer tradeRemainingTimeDays;

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "retrieved_at")
    private LocalDateTime retrievedAt;

    @Column(name = "hospital_notes")
    private String hospitalNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Approve the withdrawal request
     */
    public void approve(Integer remainingDays) {
        this.requestStatus = WithdrawalRequestStatus.APPROVED;
        this.approvedAt = LocalDateTime.now();
        this.tradeRemainingTimeDays = remainingDays;
    }

    /**
     * Mark AT as retrieved
     */
    public void markAsRetrieved() {
        this.requestStatus = WithdrawalRequestStatus.RETRIEVED;
        this.retrievedAt = LocalDateTime.now();
    }

    /**
     * Add a notification that patient has been informed
     */
    public void markAsNotified() {
        this.notifiedAt = LocalDateTime.now();
    }

    /**
     * Check if withdrawal can be processed (trade must be ended)
     */
    public boolean canProcess() {
        return requestStatus == WithdrawalRequestStatus.APPROVED &&
                tradeRemainingTimeDays != null &&
                tradeRemainingTimeDays <= 0;
    }
}
