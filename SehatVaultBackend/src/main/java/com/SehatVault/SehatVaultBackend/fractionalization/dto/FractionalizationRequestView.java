package com.SehatVault.SehatVaultBackend.fractionalization.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class FractionalizationRequestView {
    private UUID requestId;
    private UUID primaryUserId;
    private UUID hospitalId;
    private String source;
    private BigDecimal fractionalizeHtAmount;
    private String status;
    private String patientNote;

    private String insurerName;
    private String nocNumber;
    private LocalDateTime nocIssuedAt;
    private LocalDateTime nocExpiresAt;
    private String nocDocument;

    private String rejectionReason;
    private LocalDateTime createdAt;

    private List<BeneficiaryRow> beneficiaries;

    @Data
    @AllArgsConstructor
    public static class BeneficiaryRow {
        private UUID beneficiaryUserId;
        private BigDecimal fractionPercent;
        private BigDecimal allocatedHt;
    }
}
