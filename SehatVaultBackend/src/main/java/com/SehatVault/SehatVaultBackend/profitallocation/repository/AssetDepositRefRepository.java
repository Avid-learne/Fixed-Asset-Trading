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

        // Eligible deposits for profit allocation = anything whose physical custody has
        // been confirmed by the bank. The deposit's `status` field moves through
        // pending → approved → custody_confirmed, so we filter purely on custody_status.
        // (The legacy 'approved' status check was excluding every confirmed deposit.)
        @Query(value = """
                        SELECT COALESCE(SUM(ad.asset_value), 0)
                        FROM asset_deposits ad
                        WHERE ad.patient_id = :patientId
                            AND lower(ad.custody_status) = 'confirmed'
                        """, nativeQuery = true)
        BigDecimal sumApprovedAssetValueByPatientId(@Param("patientId") UUID patientId);

        @Query(value = """
                        SELECT ad.asset_id
                        FROM asset_deposits ad
                        WHERE ad.patient_id = :patientId
                            AND lower(ad.custody_status) = 'confirmed'
                        ORDER BY ad.submitted_at DESC
                        LIMIT 1
                        """, nativeQuery = true)
        UUID findLatestApprovedAssetIdByPatientId(@Param("patientId") UUID patientId);
}
