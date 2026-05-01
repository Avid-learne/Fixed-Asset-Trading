package com.SehatVault.SehatVaultBackend.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfitSettingsDto {
    private Double patientProfitPercent;
    private Double hospitalProfitPercent;
    private Double bankProfitPercent;

    /**
     * Validates that percentages sum to 100
     */
    public boolean isValid() {
        if (patientProfitPercent == null || hospitalProfitPercent == null || bankProfitPercent == null) {
            return false;
        }
        double sum = patientProfitPercent + hospitalProfitPercent + bankProfitPercent;
        // Allow small floating-point rounding differences
        return Math.abs(sum - 100.0) < 0.01 && 
               patientProfitPercent >= 0 && hospitalProfitPercent >= 0 && bankProfitPercent >= 0;
    }

    public String getValidationError() {
        if (patientProfitPercent == null || hospitalProfitPercent == null || bankProfitPercent == null) {
            return "All percentages must be provided";
        }
        if (patientProfitPercent < 0 || hospitalProfitPercent < 0 || bankProfitPercent < 0) {
            return "Percentages cannot be negative";
        }
        double sum = patientProfitPercent + hospitalProfitPercent + bankProfitPercent;
        if (Math.abs(sum - 100.0) >= 0.01) {
            return "Percentages must sum to 100% (currently: " + String.format("%.2f", sum) + "%)";
        }
        return null;
    }
}
