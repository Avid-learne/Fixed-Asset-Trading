package com.SehatVault.SehatVaultBackend.assetdeposit.dto;

public class ConfirmCustodyRequest {
    private Double verifiedPurityPercent;
    private Double verifiedWeightGrams;
    private String assetCondition; // EXCELLENT, GOOD, ACCEPTABLE, POOR
    private String serialNumber;
    private Double loanAmountApprovedPkr;
    private Double loanInterestRatePercent;
    private String verificationNotes;

    // Constructors
    public ConfirmCustodyRequest() {}

    public ConfirmCustodyRequest(Double verifiedPurityPercent, Double verifiedWeightGrams,
                                String assetCondition, String serialNumber,
                                Double loanAmountApprovedPkr, Double loanInterestRatePercent,
                                String verificationNotes) {
        this.verifiedPurityPercent = verifiedPurityPercent;
        this.verifiedWeightGrams = verifiedWeightGrams;
        this.assetCondition = assetCondition;
        this.serialNumber = serialNumber;
        this.loanAmountApprovedPkr = loanAmountApprovedPkr;
        this.loanInterestRatePercent = loanInterestRatePercent;
        this.verificationNotes = verificationNotes;
    }

    // Validation
    public boolean isValid() {
        return verifiedPurityPercent != null && verifiedPurityPercent >= 0 && verifiedPurityPercent <= 100 &&
               verifiedWeightGrams != null && verifiedWeightGrams > 0 &&
               assetCondition != null && !assetCondition.isEmpty() &&
               loanAmountApprovedPkr != null && loanAmountApprovedPkr > 0 &&
               loanInterestRatePercent != null && loanInterestRatePercent >= 0;
    }

    public String getValidationError() {
        if (verifiedPurityPercent == null || verifiedPurityPercent < 0 || verifiedPurityPercent > 100) {
            return "Purity percentage must be between 0 and 100";
        }
        if (verifiedWeightGrams == null || verifiedWeightGrams <= 0) {
            return "Weight must be greater than 0";
        }
        if (assetCondition == null || assetCondition.isEmpty()) {
            return "Asset condition is required";
        }
        if (loanAmountApprovedPkr == null || loanAmountApprovedPkr <= 0) {
            return "Loan amount must be greater than 0";
        }
        if (loanInterestRatePercent == null || loanInterestRatePercent < 0) {
            return "Interest rate cannot be negative";
        }
        return null;
    }

    // Getters and Setters
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

    public String getVerificationNotes() {
        return verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }
}
