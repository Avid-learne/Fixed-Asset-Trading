package com.SehatVault.SehatVaultBackend.bankintegration.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class HospitalBankIntegrationDto {
    private UUID partnershipId;
    private UUID bankId;
    private String bankName;
    private String bankEmail;
    private String bankCity;
    private String bankContact;
    private String bankVerificationStatus;
    private String integrationStatus;
    private String rejectionReason;
    private LocalDate partnershipStarted;
    private LocalDateTime linkedAt;
    private long totalDeposits;
    private long approvedDeposits;
    private long pendingDeposits;
    private BigDecimal totalAssetValuePkr;
}
