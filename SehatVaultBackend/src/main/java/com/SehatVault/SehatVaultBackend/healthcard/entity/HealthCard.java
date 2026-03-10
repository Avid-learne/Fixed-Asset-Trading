package com.SehatVault.SehatVaultBackend.healthcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * PatientCard Entity
 * Maps to patient_cards in schema.sql
 */
@Entity
@Table(name = "patient_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "patient_card_id")
    private UUID patientCardId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "card_id", nullable = false)
    private UUID cardId;

    @Column(name = "card_num", unique = true, nullable = false)
    private String cardNum;

    @Column(name = "ht_balance", precision = 10, scale = 2, nullable = false)
    private BigDecimal htBalance;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "cvv", nullable = false, length = 10)
    private String cvv;
}
