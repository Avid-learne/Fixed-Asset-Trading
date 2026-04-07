package com.SehatVault.SehatVaultBackend.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportLogDto {
    private String id;
    private String reportType;
    private String fromPeriod;
    private String toPeriod;
    private String status;
    private String generatedAt;
    private String generatedByName;
}
