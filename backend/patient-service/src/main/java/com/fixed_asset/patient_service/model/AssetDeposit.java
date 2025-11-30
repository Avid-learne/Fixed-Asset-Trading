package com.fixed_asset.patient_service.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "asset_deposits")
@EntityListeners(AuditingEntityListener.class)
public class AssetDeposit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String assetType; // GOLD, SILVER, CASH, etc.

    @Column(nullable = false)
    private Double assetValue;

    @Column(nullable = false)
    private Double tokensMinted;

    @Column(unique = true)
    private String depositId; // Blockchain deposit ID

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED, PROCESSED

    private String metadata; // IPFS hash or additional data

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;

    // Constructors, Getters, and Setters
    public AssetDeposit() {}

    // Add all getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public String getAssetType() { return assetType; }
    public void setAssetType(String assetType) { this.assetType = assetType; }
    public Double getAssetValue() { return assetValue; }
    public void setAssetValue(Double assetValue) { this.assetValue = assetValue; }
    public Double getTokensMinted() { return tokensMinted; }
    public void setTokensMinted(Double tokensMinted) { this.tokensMinted = tokensMinted; }
    public String getDepositId() { return depositId; }
    public void setDepositId(String depositId) { this.depositId = depositId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}