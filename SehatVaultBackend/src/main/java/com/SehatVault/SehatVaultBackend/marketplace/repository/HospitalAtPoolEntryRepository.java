package com.SehatVault.SehatVaultBackend.marketplace.repository;

import com.SehatVault.SehatVaultBackend.marketplace.entity.HospitalAtPoolEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HospitalAtPoolEntryRepository extends JpaRepository<HospitalAtPoolEntry, UUID> {

    List<HospitalAtPoolEntry> findByHospitalIdAndActiveIsTrueOrderByCreatedAtAsc(UUID hospitalId);

    Optional<HospitalAtPoolEntry> findByHospitalIdAndPatientIdAndAssetId(
        UUID hospitalId,
        UUID patientId,
        UUID assetId
    );
}
