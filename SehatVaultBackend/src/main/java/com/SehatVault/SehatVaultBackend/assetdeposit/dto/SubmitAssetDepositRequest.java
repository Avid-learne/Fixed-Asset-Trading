package com.SehatVault.SehatVaultBackend.assetdeposit.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SubmitAssetDepositRequest {
    private String assetType;
    private BigDecimal weight;
    private BigDecimal assetValue;
    private String assetReceipt;
    private String purityCertificate;
    private String supportingDocuments;
}
