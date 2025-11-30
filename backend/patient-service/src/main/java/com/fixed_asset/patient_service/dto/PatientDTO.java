package com.fixed_asset.patient_service.dto;

import java.time.LocalDateTime;

public class PatientDTO {
    private Long id;
    private String registrationId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String walletAddress;
    private Double assetTokenBalance;
    private Double healthTokenBalance;
    private LocalDateTime createdAt;

    // Constructors
    public PatientDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRegistrationId() { return registrationId; }
    public void setRegistrationId(String registrationId) { this.registrationId = registrationId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getWalletAddress() { return walletAddress; }
    public void setWalletAddress(String walletAddress) { this.walletAddress = walletAddress; }
    public Double getAssetTokenBalance() { return assetTokenBalance; }
    public void setAssetTokenBalance(Double assetTokenBalance) { this.assetTokenBalance = assetTokenBalance; }
    public Double getHealthTokenBalance() { return healthTokenBalance; }
    public void setHealthTokenBalance(Double healthTokenBalance) { this.healthTokenBalance = healthTokenBalance; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}