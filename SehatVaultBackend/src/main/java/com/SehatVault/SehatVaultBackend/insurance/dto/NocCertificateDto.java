package com.SehatVault.SehatVaultBackend.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class NocCertificateDto {
    private UUID nocId;
    private String nocNumber;
    private UUID fractionalizationRequestId;
    private String status; // ISSUED, EXPIRED, REVOKED, PENDING
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private String documentUrl;
    private String remarks;
    private LocalDateTime createdAt;
}
