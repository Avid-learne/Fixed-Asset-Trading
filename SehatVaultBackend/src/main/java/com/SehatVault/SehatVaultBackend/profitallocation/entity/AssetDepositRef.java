package com.SehatVault.SehatVaultBackend.profitallocation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "asset_deposits")
@Data
public class AssetDepositRef {

    @Id
    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}
