package com.fixed_asset.patient_service.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "token_balances")
@EntityListeners(AuditingEntityListener.class)
public class TokenBalance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "patient_id", unique = true, nullable = false)
    private Patient patient;

    @Column(name = "asset_token_balance", nullable = false)
    private Double assetTokenBalance = 0.0;

    @Column(name = "health_token_balance", nullable = false)
    private Double healthTokenBalance = 0.0;

    @Column(name = "last_asset_token_update")
    private LocalDateTime lastAssetTokenUpdate;

    @Column(name = "last_health_token_update")
    private LocalDateTime lastHealthTokenUpdate;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public TokenBalance() {}

    public TokenBalance(Patient patient) {
        this.patient = patient;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public Double getAssetTokenBalance() { return assetTokenBalance; }
    public void setAssetTokenBalance(Double assetTokenBalance) { 
        this.assetTokenBalance = assetTokenBalance;
        this.lastAssetTokenUpdate = LocalDateTime.now();
    }
    public Double getHealthTokenBalance() { return healthTokenBalance; }
    public void setHealthTokenBalance(Double healthTokenBalance) { 
        this.healthTokenBalance = healthTokenBalance;
        this.lastHealthTokenUpdate = LocalDateTime.now();
    }
    public LocalDateTime getLastAssetTokenUpdate() { return lastAssetTokenUpdate; }
    public void setLastAssetTokenUpdate(LocalDateTime lastAssetTokenUpdate) { this.lastAssetTokenUpdate = lastAssetTokenUpdate; }
    public LocalDateTime getLastHealthTokenUpdate() { return lastHealthTokenUpdate; }
    public void setLastHealthTokenUpdate(LocalDateTime lastHealthTokenUpdate) { this.lastHealthTokenUpdate = lastHealthTokenUpdate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}