package com.SehatVault.SehatVaultBackend.dashboard.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class SuperAdminBankDetailsDto {
    private UUID bankId;
    private String bankName;
    private String registration;
    private String swiftCode;
    private String bankCode;
    private String address;
    private String email;
    private String contactNum;
    private String city;
    private String verificationStatus;
    private LocalDateTime createdAt;

    private long activePartnerships;
    private long totalDeposits;
    private BigDecimal totalAssetValuePkr = BigDecimal.ZERO;

    private List<LinkedHospital> linkedHospitals = new ArrayList<>();

    @Data
    public static class LinkedHospital {
        private UUID partnershipId;
        private UUID hospitalId;
        private String hospitalName;
        private String hospitalVerificationStatus;
        private String integrationStatus;
        private LocalDateTime linkedAt;
        private long totalDeposits;
        private long approvedDeposits;
        private long pendingDeposits;
        private BigDecimal totalAssetValuePkr = BigDecimal.ZERO;
    }
}
