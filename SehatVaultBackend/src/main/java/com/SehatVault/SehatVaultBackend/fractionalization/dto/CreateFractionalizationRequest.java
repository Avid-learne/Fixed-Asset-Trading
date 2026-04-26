package com.SehatVault.SehatVaultBackend.fractionalization.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateFractionalizationRequest {
    /** SUBSCRIPTION | ASSET */
    private String source;

    /** amount of HT to fractionalize from the chosen source */
    private BigDecimal fractionalizeHtAmount;

    private String patientNote;

    private List<BeneficiaryShare> beneficiaries;

    @Data
    public static class BeneficiaryShare {
        /** beneficiary user id */
        private UUID beneficiaryUserId;

        /** percent (0..100) of fractionalizeHtAmount */
        private BigDecimal fractionPercent;
    }
}
