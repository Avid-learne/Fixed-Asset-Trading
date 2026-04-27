package com.SehatVault.SehatVaultBackend.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IssueNocCertificateRequest {
    private UUID fractionalizationRequestId;
    private UUID patientId;
    private UUID hospitalId;
    private Integer validityDays; // Default 365
    private String remarks;
}
