package com.SehatVault.SehatVaultBackend.wallet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patient_token_balances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientTokenBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "balance_id")
    private UUID balanceId;

    @Column(name = "patient_id", nullable = false, unique = true)
    private UUID patientId;

    @Column(name = "total_at")
    private BigDecimal totalAt;

    @Column(name = "total_ht")
    private BigDecimal totalHt;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}
