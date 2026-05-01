package com.SehatVault.SehatVaultBackend.assetdeposit.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_custody_verifications")
public class BankCustodyVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String verificationId;

    @ManyToOne
    @JoinColumn(name = "deposit_id", nullable = false)
    private AssetDeposit deposit;

    @Column(name = "verified_purity_percent", nullable = false)
    private Double verifiedPurityPercent;

    @Column(name = "verified_weight_grams", nullable = false)
    private Double verifiedWeightGrams;

    @Column(name = "asset_condition", nullable = false)
    private String assetCondition; // EXCELLENT, GOOD, ACCEPTABLE, POOR

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "loan_amount_approved_pkr", nullable = false)
    private Double loanAmountApprovedPkr;

    @Column(name = "loan_interest_rate_percent", nullable = false)
    private Double loanInterestRatePercent;

    @Column(name = "bank_staff_id", nullable = false)
    private String bankStaffId;

    @Column(name = "verification_notes")
    private String verificationNotes;

    @Column(name = "verified_at", nullable = false)
    private LocalDateTime verifiedAt;

    @Column(name = "custody_received_at")
    private LocalDateTime custodyReceivedAt;

    // Constructors
    public BankCustodyVerification() {}

    public BankCustodyVerification(AssetDeposit deposit, Double verifiedPurityPercent, Double verifiedWeightGrams,
                                  String assetCondition, String serialNumber, Double loanAmountApprovedPkr,
                                  Double loanInterestRatePercent, String bankStaffId) {
        this.deposit = deposit;
        this.verifiedPurityPercent = verifiedPurityPercent;
        this.verifiedWeightGrams = verifiedWeightGrams;
        this.assetCondition = assetCondition;
        this.serialNumber = serialNumber;
        this.loanAmountApprovedPkr = loanAmountApprovedPkr;
        this.loanInterestRatePercent = loanInterestRatePercent;
        this.bankStaffId = bankStaffId;
        this.verifiedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getVerificationId() {
        return verificationId;
    }

    public void setVerificationId(String verificationId) {
        this.verificationId = verificationId;
    }

    public AssetDeposit getDeposit() {
        return deposit;
    }

    public void setDeposit(AssetDeposit deposit) {
        this.deposit = deposit;
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
