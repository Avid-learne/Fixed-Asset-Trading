package com.SehatVault.SehatVaultBackend.bankintegration.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BankHospitalIntegrationDto {
    private UUID partnershipId;
    private UUID hospitalId;
    private String hospitalName;
    private String hospitalEmail;
    private String hospitalCity;
    private String hospitalContact;
    private String hospitalVerificationStatus;
    private String integrationStatus;
    private String rejectionReason;
    private LocalDate partnershipStarted;
    private LocalDateTime linkedAt;
    private long totalDeposits;
    private long approvedDeposits;
    private long pendingDeposits;
    private BigDecimal totalAssetValuePkr;
}
