package com.SehatVault.SehatVaultBackend.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentStatusDto {
    private UUID documentId;
    private String documentType;
    private String status; // SUBMITTED, VERIFIED, REJECTED, PENDING_REVIEW
    private String documentUrl;
    private String verificationNotes;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;
}
