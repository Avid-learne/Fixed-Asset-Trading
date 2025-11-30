package com.fixed_asset.patient_service.dto;

import java.time.LocalDateTime;

public class RedemptionResponse {
    private String redemptionId;
    private Long patientId;
    private String serviceType;
    private Double htAmount;
    private String status;
    private LocalDateTime redeemedAt;
    private String message;

    // Constructors
    public RedemptionResponse() {}

    public RedemptionResponse(String redemptionId, Long patientId, String serviceType, Double htAmount, String status, LocalDateTime redeemedAt, String message) {
        this.redemptionId = redemptionId;
        this.patientId = patientId;
        this.serviceType = serviceType;
        this.htAmount = htAmount;
        this.status = status;
        this.redeemedAt = redeemedAt;
        this.message = message;
    }

    // Getters and Setters
    public String getRedemptionId() { return redemptionId; }
    public void setRedemptionId(String redemptionId) { this.redemptionId = redemptionId; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public Double getHtAmount() { return htAmount; }
    public void setHtAmount(Double htAmount) { this.htAmount = htAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getRedeemedAt() { return redeemedAt; }
    public void setRedeemedAt(LocalDateTime redeemedAt) { this.redeemedAt = redeemedAt; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}