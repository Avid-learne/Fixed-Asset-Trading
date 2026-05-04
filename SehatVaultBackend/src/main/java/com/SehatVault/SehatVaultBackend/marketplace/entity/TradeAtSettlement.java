package com.SehatVault.SehatVaultBackend.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * TradeAtSettlement entity - Tracks settlement of trades when they end.
 * Mapped to trade_at_settlements table.
 */
@Entity
@Table(name = "trade_at_settlements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradeAtSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "settlement_id")
    private UUID settlementId;

    @Column(name = "trade_id", nullable = false, unique = true)
    private UUID tradeId;

    @Column(name = "participation_id", nullable = false)
    private UUID participationId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "original_at_allocated", nullable = false)
    private BigDecimal originalAtAllocated;

    @Column(name = "trade_profit_loss", nullable = false)
    private BigDecimal tradeProfitLoss;

    @Column(name = "at_returned_available", nullable = false)
    private BigDecimal atReturnedAvailable;

    @Column(name = "profit_percentage", nullable = false)
    private BigDecimal profitPercentage;

    @Column(name = "profit_ht_issued", nullable = false)
    private BigDecimal profitHtIssued;

    @Column(name = "total_monthly_ht_issued", nullable = false)
    @lombok.Builder.Default
    private BigDecimal totalMonthlyHtIssued = BigDecimal.ZERO;

    @Column(name = "trade_end_time", nullable = false)
    private LocalDateTime tradeEndTime;

    @Column(name = "settled_at", nullable = false)
    private LocalDateTime settledAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Calculate total HT issued (monthly distributions + profit HT)
     */
    public BigDecimal getTotalHtIssued() {
        return totalMonthlyHtIssued.add(profitHtIssued);
    }

    /**
     * Check if trade was profitable
     */
    public boolean isTradeProfit() {
        return tradeProfitLoss.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Get loss amount (as absolute value)
     */
    public BigDecimal getLossAmount() {
        if (isTradeProfit()) {
            return BigDecimal.ZERO;
        }
        return tradeProfitLoss.abs();
    }
}
