package com.SehatVault.SehatVaultBackend.profitallocation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profit_distributions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfitDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "profit_distribution_id")
    private UUID profitDistributionId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "total_profit", nullable = false)
    private BigDecimal totalProfit;

    @Column(name = "patients_percentage", nullable = false)
    private BigDecimal patientsPercentage;

    @Column(name = "hospital_operations", nullable = false)
    private BigDecimal hospitalOperations;

    @Column(name = "hospital_earning", nullable = false)
    private BigDecimal hospitalEarning;

    @Column(name = "bank_loan_funds")
    private BigDecimal bankLoanFunds = BigDecimal.ZERO;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
