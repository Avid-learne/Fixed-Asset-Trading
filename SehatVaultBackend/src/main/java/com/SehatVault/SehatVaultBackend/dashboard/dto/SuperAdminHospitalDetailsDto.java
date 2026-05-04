package com.SehatVault.SehatVaultBackend.dashboard.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class SuperAdminHospitalDetailsDto {
    private UUID hospitalId;
    private String hospitalName;
    private String registrationNumber;
    private String address;
    private String email;
    private String contactNum;
    private String city;
    private String verificationStatus;
    private LocalDateTime createdAt;

    private long patientCount;
    private long totalDeposits;
    private BigDecimal totalAssets = BigDecimal.ZERO;
    private BigDecimal totalAT = BigDecimal.ZERO;

    private List<LinkedBank> linkedBanks = new ArrayList<>();

    @Data
    public static class LinkedBank {
        private UUID partnershipId;
        private UUID bankId;
        private String bankName;
        private String bankVerificationStatus;
        private String integrationStatus;
        private LocalDateTime linkedAt;
        private long totalDeposits;
        private long approvedDeposits;
        private long pendingDeposits;
        private BigDecimal totalAssetValuePkr = BigDecimal.ZERO;
    }
}
