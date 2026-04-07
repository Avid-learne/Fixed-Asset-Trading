package com.SehatVault.SehatVaultBackend.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Profile Response DTO
 * Returns user profile information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    
    private UUID userId;
    private String name;
    private String email;
    private String cnic;
    private String phoneNum;
    private String address;
    private String city;
    private String bloodGroup;
    private LocalDate dateOfBirth;
    private String role;
    private String status;
    
    // Patient-specific fields
    private UUID patientId;
    private String walletAddress;
    private Boolean hasAsset;
    private Boolean hasSubscription;
    private String kycStatus;
    private String registrationId;
    private UUID hospitalId;
    private String hospitalName;
    private BigDecimal totalAt;
    private BigDecimal totalHt;
    private Integer totalAssets;
}
