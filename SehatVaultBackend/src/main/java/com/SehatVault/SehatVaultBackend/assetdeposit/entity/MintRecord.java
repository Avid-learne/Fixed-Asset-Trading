package com.SehatVault.SehatVaultBackend.assetdeposit.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mint_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MintRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "mint_id")
    private UUID mintId;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "minter_id", nullable = false)
    private UUID minterId;

    @Column(name = "tokens_minted", nullable = false)
    private BigDecimal tokensMinted;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "block_number")
    private Long blockNumber;

    @Column(name = "transaction_hash")
    private String transactionHash;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "PENDING";
        }
    }
}
