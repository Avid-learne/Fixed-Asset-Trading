package com.fixed_asset.patient_service.dto;

import java.time.LocalDateTime;

public class DepositResponse {
    private Long id;
    private Long patientId;
    private String assetType;
    private Double assetValue;
    private Double tokensMinted;
    private String depositId;
    private String status;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    // Constructors
    public DepositResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
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