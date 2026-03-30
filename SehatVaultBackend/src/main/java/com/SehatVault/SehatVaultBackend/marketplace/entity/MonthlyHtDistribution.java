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
 * MonthlyHtDistribution entity - Tracks monthly HT distributions (5% of AT
 * monetary value).
 * Mapped to monthly_ht_distributions table.
 */
@Entity
@Table(name = "monthly_ht_distributions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyHtDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "distribution_id")
    private UUID distributionId;

    @Column(name = "trade_id", nullable = false)
    private UUID tradeId;

    @Column(name = "participation_id", nullable = false)
    private UUID participationId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "distribution_month", nullable = false)
    private LocalDate distributionMonth;

    @Column(name = "at_percentage_rate", nullable = false)
    @lombok.Builder.Default
    private BigDecimal atPercentageRate = new BigDecimal("5");

    @Column(name = "at_amount_base", nullable = false)
    private BigDecimal atAmountBase;

    @Column(name = "calculated_ht_amount", nullable = false)
    private BigDecimal calculatedHtAmount;

    @Column(name = "is_distributed", nullable = false)
    @lombok.Builder.Default
    private Boolean isDistributed = false;

    @Column(name = "distributed_at")
    private LocalDateTime distributedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Mark distribution as distributed
     */
    public void markAsDistributed() {
        this.isDistributed = true;
        this.distributedAt = LocalDateTime.now();
    }

    /**
     * Check if distribution is pending
     */
    public boolean isPending() {
        return !isDistributed;
    }
}
