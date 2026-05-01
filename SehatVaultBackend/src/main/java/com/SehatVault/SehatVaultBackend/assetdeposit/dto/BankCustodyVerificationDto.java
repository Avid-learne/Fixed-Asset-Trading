package com.SehatVault.SehatVaultBackend.assetdeposit.dto;

import java.time.LocalDateTime;

public class BankCustodyVerificationDto {
    private String verificationId;
    private String depositId;
    private Double verifiedPurityPercent;
    private Double verifiedWeightGrams;
    private String assetCondition;
    private String serialNumber;
    private Double loanAmountApprovedPkr;
    private Double loanInterestRatePercent;
    private String bankStaffId;
    private String verificationNotes;
    private LocalDateTime verifiedAt;
    private LocalDateTime custodyReceivedAt;

    // Constructors
    public BankCustodyVerificationDto() {}

    public BankCustodyVerificationDto(String verificationId, String depositId, Double verifiedPurityPercent,
                                      Double verifiedWeightGrams, String assetCondition, String serialNumber,
                                      Double loanAmountApprovedPkr, Double loanInterestRatePercent,
                                      String bankStaffId, LocalDateTime verifiedAt) {
        this.verificationId = verificationId;
        this.depositId = depositId;
        this.verifiedPurityPercent = verifiedPurityPercent;
        this.verifiedWeightGrams = verifiedWeightGrams;
        this.assetCondition = assetCondition;
        this.serialNumber = serialNumber;
        this.loanAmountApprovedPkr = loanAmountApprovedPkr;
        this.loanInterestRatePercent = loanInterestRatePercent;
        this.bankStaffId = bankStaffId;
        this.verifiedAt = verifiedAt;
    }

    // Getters and Setters
    public String getVerificationId() {
        return verificationId;
    }

    public void setVerificationId(String verificationId) {
        this.verificationId = verificationId;
    }

    public String getDepositId() {
        return depositId;
    }

    public void setDepositId(String depositId) {
        this.depositId = depositId;
    }

    public Double getVerifiedPurityPercent() {
        return verifiedPurityPercent;
    }

    public void setVerifiedPurityPercent(Double verifiedPurityPercent) {
        this.verifiedPurityPercent = verifiedPurityPercent;
    }

    public Double getVerifiedWeightGrams() {
        return verifiedWeightGrams;
    }

    public void setVerifiedWeightGrams(Double verifiedWeightGrams) {
        this.verifiedWeightGrams = verifiedWeightGrams;
    }

    public String getAssetCondition() {
        return assetCondition;
    }

    public void setAssetCondition(String assetCondition) {
        this.assetCondition = assetCondition;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public Double getLoanAmountApprovedPkr() {
        return loanAmountApprovedPkr;
    }

    public void setLoanAmountApprovedPkr(Double loanAmountApprovedPkr) {
        this.loanAmountApprovedPkr = loanAmountApprovedPkr;
    }

    public Double getLoanInterestRatePercent() {
        return loanInterestRatePercent;
    }

    public void setLoanInterestRatePercent(Double loanInterestRatePercent) {
        this.loanInterestRatePercent = loanInterestRatePercent;
    }

    public String getBankStaffId() {
        return bankStaffId;
    }

    public void setBankStaffId(String bankStaffId) {
        this.bankStaffId = bankStaffId;
    }

    public String getVerificationNotes() {
        return verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public LocalDateTime getCustodyReceivedAt() {
        return custodyReceivedAt;
    }

    public void setCustodyReceivedAt(LocalDateTime custodyReceivedAt) {
        this.custodyReceivedAt = custodyReceivedAt;
    }
}
