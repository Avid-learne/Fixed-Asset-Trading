package com.SehatVault.SehatVaultBackend.fractionalization.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminDecisionRequest {
    /** for rejection */
    private String rejectionReason;

    /** required for approval/activation */
    private String insurerName;
    private String nocNumber;
    private LocalDateTime nocIssuedAt;
    private LocalDateTime nocExpiresAt;
    private String nocDocument;
}
