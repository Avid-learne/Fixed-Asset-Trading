package com.fixed_asset.patient_service.dto;

public class TokenBalanceDTO {
    private Long patientId;
    private Double assetTokenBalance;
    private Double healthTokenBalance;
    private String walletAddress;

    // Constructors
    public TokenBalanceDTO() {}

    public TokenBalanceDTO(Long patientId, Double assetTokenBalance, Double healthTokenBalance, String walletAddress) {
        this.patientId = patientId;
        this.assetTokenBalance = assetTokenBalance;
        this.healthTokenBalance = healthTokenBalance;
        this.walletAddress = walletAddress;
    }

    // Getters and Setters
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Double getAssetTokenBalance() { return assetTokenBalance; }
    public void setAssetTokenBalance(Double assetTokenBalance) { this.assetTokenBalance = assetTokenBalance; }
    public Double getHealthTokenBalance() { return healthTokenBalance; }
    public void setHealthTokenBalance(Double healthTokenBalance) { this.healthTokenBalance = healthTokenBalance; }
    public String getWalletAddress() { return walletAddress; }
    public void setWalletAddress(String walletAddress) { this.walletAddress = walletAddress; }
}