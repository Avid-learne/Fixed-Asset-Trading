package com.fixed_asset.patient_service.dto;

// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.Positive;

public class DepositRequest {
    // @NotNull(message = "Patient ID is required")
    private Long patientId;
    
    // @NotBlank(message = "Asset type is required")
    private String assetType;
    
    // @NotNull(message = "Asset value is required")
    // @Positive(message = "Asset value must be positive")
    private Double assetValue;
    
    private String description;
    private String supportingDocuments;

    // Constructors
    public DepositRequest() {}

    public DepositRequest(Long patientId, String assetType, Double assetValue, String description, String supportingDocuments) {
        this.patientId = patientId;
        this.assetType = assetType;
        this.assetValue = assetValue;
        this.description = description;
        this.supportingDocuments = supportingDocuments;
    }

    // Getters and Setters
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getAssetType() { return assetType; }
    public void setAssetType(String assetType) { this.assetType = assetType; }
    public Double getAssetValue() { return assetValue; }
    public void setAssetValue(Double assetValue) { this.assetValue = assetValue; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSupportingDocuments() { return supportingDocuments; }
    public void setSupportingDocuments(String supportingDocuments) { this.supportingDocuments = supportingDocuments; }
}