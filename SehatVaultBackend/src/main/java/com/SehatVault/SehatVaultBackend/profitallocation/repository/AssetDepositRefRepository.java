package com.SehatVault.SehatVaultBackend.profitallocation.repository;

import com.SehatVault.SehatVaultBackend.profitallocation.entity.AssetDepositRef;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface AssetDepositRefRepository extends JpaRepository<AssetDepositRef, UUID> {
    Optional<AssetDepositRef> findTopByPatientIdOrderBySubmittedAtDesc(UUID patientId);

        @Query(value = """
                        SELECT COALESCE(SUM(ad.asset_value), 0)
                        FROM asset_deposits ad
                        WHERE ad.patient_id = :patientId
                            AND lower(ad.status) = 'approved'
                        """, nativeQuery = true)
        BigDecimal sumApprovedAssetValueByPatientId(@Param("patientId") UUID patientId);

        @Query(value = """
                        SELECT ad.asset_id
                        FROM asset_deposits ad
                        WHERE ad.patient_id = :patientId
                            AND lower(ad.status) = 'approved'
                        ORDER BY ad.submitted_at DESC
                        LIMIT 1
                        """, nativeQuery = true)
        UUID findLatestApprovedAssetIdByPatientId(@Param("patientId") UUID patientId);
}
