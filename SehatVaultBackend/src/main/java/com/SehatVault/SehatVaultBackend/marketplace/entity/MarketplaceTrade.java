package com.SehatVault.SehatVaultBackend.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * MarketplaceTrade entity mapped to public.trades.
 */
@Entity
@Table(name = "trades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceTrade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "trade_id")
    private UUID tradeId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "amount_invested", nullable = false)
    private BigDecimal amountInvested;

    @Column(name = "investment_description")
    private String investmentDescription;

    @Column(name = "trade_title", nullable = false)
    private String tradeTitle;

    @Column(name = "trade_description")
    private String tradeDescription;

    @Column(name = "amount_before_trade", nullable = false)
    private BigDecimal amountBeforeTrade;

    @Column(name = "amount_after_trade")
    private BigDecimal amountAfterTrade;

    @Column(name = "profit_loss")
    private BigDecimal profitLoss;

    @Enumerated(EnumType.STRING)
    @Column(name = "trade_type", nullable = false)
    private TradeType tradeType;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "total_at_burnt")
    private BigDecimal totalAtBurnt = BigDecimal.ZERO;

    @Column(name = "opening_price")
    private BigDecimal openingPrice;

    @Column(name = "closing_price")
    private BigDecimal closingPrice;

    @Column(name = "high")
    private BigDecimal high;

    @Column(name = "low")
    private BigDecimal low;

    @Column(name = "volume")
    private BigDecimal volume;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TradeStatus status = TradeStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TradeType {
        BUY,
        SELL
    }

    public enum TradeStatus {
        ACTIVE,
        CLOSED,
        CANCELLED
    }
}
