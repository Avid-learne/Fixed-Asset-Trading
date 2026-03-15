package com.SehatVault.SehatVaultBackend.profitallocation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profit_allocations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfitAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "profit_allocation_id")
    private UUID profitAllocationId;

    @Column(name = "profit_distribution_id", nullable = false)
    private UUID profitDistributionId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "allocated_percentage", nullable = false)
    private BigDecimal allocatedPercentage;

    @Column(name = "allocated_amount_ht", nullable = false)
    private BigDecimal allocatedAmountHt;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
