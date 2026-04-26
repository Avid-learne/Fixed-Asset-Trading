package com.SehatVault.SehatVaultBackend.fractionalization.entity;

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
import java.util.UUID;

@Entity
@Table(name = "fractionalization_beneficiaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FractionalizationBeneficiary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "beneficiary_id")
    private UUID beneficiaryId;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Column(name = "beneficiary_patient_id", nullable = false)
    private UUID beneficiaryPatientId;

    @Column(name = "beneficiary_user_id", nullable = false)
    private UUID beneficiaryUserId;

    /** percent of fractionalize_ht_amount (0..100) */
    @Column(name = "fraction_percent", nullable = false, precision = 8, scale = 4)
    private BigDecimal fractionPercent;

    @Column(name = "allocated_ht", nullable = false, precision = 18, scale = 6)
    private BigDecimal allocatedHt;
}
