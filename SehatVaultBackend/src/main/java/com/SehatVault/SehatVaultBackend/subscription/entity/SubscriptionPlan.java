package com.SehatVault.SehatVaultBackend.subscription.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * SubscriptionPlan Entity
 * Represents health subscription plans offered by hospitals
 */
@Entity
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "subs_id")
    private UUID subsId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "subscription_name", nullable = false)
    private String subscriptionName;

    @Column(name = "amount_per_month", nullable = false)
    private BigDecimal amountPerMonth;

    @Column(name = "features", columnDefinition = "TEXT")
    private String features;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "monthly_ht", nullable = false)
    private Integer monthlyHt = 0;
}
