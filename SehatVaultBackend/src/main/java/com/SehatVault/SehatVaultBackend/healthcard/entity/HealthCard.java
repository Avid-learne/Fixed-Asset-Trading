package com.SehatVault.SehatVaultBackend.healthcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Health Card Entity
 * Represents both subscription-based and asset-based health cards
 */
@Entity
@Table(name = "health_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "card_id")
    private UUID cardId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "card_number", unique = true, nullable = false, length = 50)
    private String cardNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false, length = 20)
    private CardType cardType;

    @Column(name = "holder_name", nullable = false, length = 100)
    private String holderName;

    @Column(name = "plan_name", length = 100)
    private String planName; // For subscription-based cards

    @Column(name = "asset_value", precision = 10, scale = 2)
    private BigDecimal assetValue; // For asset-based cards

    @Column(name = "ht_balance", precision = 10, scale = 2, nullable = false)
    private BigDecimal htBalance;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CardStatus status;

    @Column(name = "cvv", nullable = false, length = 10)
    private String cvv;

    @Column(name = "security_key", nullable = false, length = 50)
    private String securityKey;

    @Column(name = "subscription_id")
    private UUID subscriptionId; // Link to subscription if subscription-based

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum CardType {
        SUBSCRIPTION,
        ASSET
    }

    public enum CardStatus {
        ACTIVE,
        EXPIRED,
        SUSPENDED,
        CANCELLED
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
