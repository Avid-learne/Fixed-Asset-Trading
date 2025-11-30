package com.fixed_asset.patient_service.dto;

public class HealthBenefitDTO {
    private String serviceType;
    private String description;
    private Double htCost;
    private Boolean available;
    private String eligibility;

    // Constructors
    public HealthBenefitDTO() {}

    public HealthBenefitDTO(String serviceType, String description, Double htCost, Boolean available, String eligibility) {
        this.serviceType = serviceType;
        this.description = description;
        this.htCost = htCost;
        this.available = available;
        this.eligibility = eligibility;
    }

    // Getters and Setters
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getHtCost() { return htCost; }
    public void setHtCost(Double htCost) { this.htCost = htCost; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }
}