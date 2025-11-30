package com.fixed_asset.patient_service.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@EntityListeners(AuditingEntityListener.class)
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String registrationId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    private String address;

    @Column(nullable = false)
    private String password;

    @Column(name = "wallet_address")
    private String walletAddress;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AssetDeposit> assetDeposits = new ArrayList<>();

    @Column(name = "asset_token_balance")
    private Double assetTokenBalance = 0.0;

    @Column(name = "health_token_balance")
    private Double healthTokenBalance = 0.0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors, Getters, and Setters
    public Patient() {}

    // Add all getters and setters
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
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getWalletAddress() { return walletAddress; }
    public void setWalletAddress(String walletAddress) { this.walletAddress = walletAddress; }
    public List<AssetDeposit> getAssetDeposits() { return assetDeposits; }
    public void setAssetDeposits(List<AssetDeposit> assetDeposits) { this.assetDeposits = assetDeposits; }
    public Double getAssetTokenBalance() { return assetTokenBalance; }
    public void setAssetTokenBalance(Double assetTokenBalance) { this.assetTokenBalance = assetTokenBalance; }
    public Double getHealthTokenBalance() { return healthTokenBalance; }
    public void setHealthTokenBalance(Double healthTokenBalance) { this.healthTokenBalance = healthTokenBalance; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}