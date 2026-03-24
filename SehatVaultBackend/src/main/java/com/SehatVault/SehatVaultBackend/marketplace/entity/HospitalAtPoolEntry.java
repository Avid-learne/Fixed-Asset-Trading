package com.SehatVault.SehatVaultBackend.marketplace.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hospital_at_pool_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalAtPoolEntry {

    public enum PoolType {
        SUBSCRIPTION,  // Traded when all subscriptions for current month are paid
        ASSET          // Traded when admin manually triggers trade
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "pool_entry_id")
    private UUID poolEntryId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "pool_type", nullable = false)
    private PoolType poolType = PoolType.ASSET;

    @Column(name = "total_at_added", nullable = false)
    private BigDecimal totalAtAdded = BigDecimal.ZERO;

    @Column(name = "available_at", nullable = false)
    private BigDecimal availableAt = BigDecimal.ZERO;

    @Column(name = "total_at_burned", nullable = false)
    private BigDecimal totalAtBurned = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (totalAtAdded == null) {
            totalAtAdded = BigDecimal.ZERO;
        }
        if (availableAt == null) {
            availableAt = BigDecimal.ZERO;
        }
        if (totalAtBurned == null) {
            totalAtBurned = BigDecimal.ZERO;
        }
        if (active == null) {
            active = Boolean.TRUE;
        }
        if (poolType == null) {
            poolType = PoolType.ASSET;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
