package com.SehatVault.SehatVaultBackend.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * TradeParticipation entity - Tracks patient participation in individual
 * trades.
 * Mapped to trade_participations table.
 */
@Entity
@Table(name = "trade_participations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeParticipation {

    public enum ParticipationStatus {
        ACTIVE, // Trade is ongoing
        SETTLED, // Trade has ended and been settled
        WITHDRAWN // Patient withdrew during trade
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "participation_id")
    private UUID participationId;

    @Column(name = "trade_id", nullable = false)
    private UUID tradeId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "assignment_id", nullable = false)
    private UUID assignmentId;

    @Column(name = "at_allocated", nullable = false)
    private BigDecimal atAllocated;

    @Column(name = "at_monetary_value_pkr", nullable = false)
    private BigDecimal atMonetaryValuePkr;

    @Enumerated(EnumType.STRING)
    @Column(name = "participation_status", nullable = false)
    @lombok.Builder.Default
    private ParticipationStatus participationStatus = ParticipationStatus.ACTIVE;

    @Column(name = "trade_start_time", nullable = false)
    private LocalDateTime tradeStartTime;

    @Column(name = "trade_end_time")
    private LocalDateTime tradeEndTime;

    @Column(name = "marked_unavailable_at")
    private LocalDateTime markedUnavailableAt;

    /**
     * Date of the next due monthly HT auto-allocation while AT is locked in this trade.
     * Bumped forward one month each time the scheduler credits HT. Null on legacy rows
     * is treated as "due now" + one month after trade start time.
     */
    @Column(name = "next_ht_allocation_at")
    private LocalDate nextHtAllocationAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Calculate monthly HT distribution (5% of monetary value)
     */
    public BigDecimal calculateMonthlyHtDistribution() {
        return atMonetaryValuePkr.multiply(new BigDecimal("0.05"));
    }
}
