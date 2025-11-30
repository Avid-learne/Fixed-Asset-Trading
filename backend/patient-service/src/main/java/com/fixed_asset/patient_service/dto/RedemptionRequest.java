package com.fixed_asset.patient_service.dto;

// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;

public class RedemptionRequest {
    // @NotNull(message = "Patient ID is required")
    private Long patientId;
    
    // @NotBlank(message = "Service type is required")
    private String serviceType;
    
    // @NotNull(message = "HT amount is required")
    private Double htAmount;

    // Constructors
    public RedemptionRequest() {}

    public RedemptionRequest(Long patientId, String serviceType, Double htAmount) {
        this.patientId = patientId;
        this.serviceType = serviceType;
        this.htAmount = htAmount;
    }

    // Getters and Setters
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public Double getHtAmount() { return htAmount; }
    public void setHtAmount(Double htAmount) { this.htAmount = htAmount; }
}