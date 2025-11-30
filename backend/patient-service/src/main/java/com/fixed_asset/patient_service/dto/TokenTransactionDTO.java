package com.fixed_asset.patient_service.dto;

import java.time.LocalDateTime;

public class TokenTransactionDTO {
    private String transactionHash;
    private String transactionType; // MINT, BURN, TRANSFER, REDEEM
    private Double amount;
    private String tokenType; // AT, HT
    private LocalDateTime timestamp;
    private String status;

    // Constructors
    public TokenTransactionDTO() {}

    public TokenTransactionDTO(String transactionHash, String transactionType, Double amount, String tokenType, LocalDateTime timestamp, String status) {
        this.transactionHash = transactionHash;
        this.transactionType = transactionType;
        this.amount = amount;
        this.tokenType = tokenType;
        this.timestamp = timestamp;
        this.status = status;
    }

    // Getters and Setters
    public String getTransactionHash() { return transactionHash; }
    public void setTransactionHash(String transactionHash) { this.transactionHash = transactionHash; }
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}