package com.SehatVault.SehatVaultBackend.report.dto;

import lombok.Data;

@Data
public class GenerateReportRequest {
    private String fromPeriod; // yyyy-MM-dd
    private String toPeriod;   // yyyy-MM-dd
    private String reportType; // FINANCIAL, DEPOSITS, MINTING, PATIENTS, TRADING
}
