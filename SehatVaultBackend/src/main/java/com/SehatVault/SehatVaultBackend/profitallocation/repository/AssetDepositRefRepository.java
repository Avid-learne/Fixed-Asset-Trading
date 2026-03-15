package com.SehatVault.SehatVaultBackend.profitallocation.repository;

import com.SehatVault.SehatVaultBackend.profitallocation.entity.AssetDepositRef;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AssetDepositRefRepository extends JpaRepository<AssetDepositRef, UUID> {
    Optional<AssetDepositRef> findTopByPatientIdOrderBySubmittedAtDesc(UUID patientId);
}
