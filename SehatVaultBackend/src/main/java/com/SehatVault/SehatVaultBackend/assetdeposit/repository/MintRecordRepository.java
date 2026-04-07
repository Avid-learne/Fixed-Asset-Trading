package com.SehatVault.SehatVaultBackend.assetdeposit.repository;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.MintRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface MintRecordRepository extends JpaRepository<MintRecord, UUID> {

    @Query("""
        SELECT COALESCE(SUM(m.tokensMinted), 0)
        FROM MintRecord m
        WHERE m.assetId = :assetId
          AND UPPER(m.status) <> 'FAILED'
        """)
    BigDecimal sumTokensMintedByAssetId(@Param("assetId") UUID assetId);

    List<MintRecord> findByPatientIdOrderByTimestampDesc(UUID patientId);

    @Query(value = """
        SELECT COALESCE(SUM(m.tokens_minted), 0)
        FROM mint_records m
        JOIN asset_deposits d ON d.asset_id = m.asset_id
        JOIN patients p ON p.id = d.patient_id
        WHERE p.hospital_id = :hospitalId
          AND UPPER(m.status) <> 'FAILED'
        """, nativeQuery = true)
    BigDecimal sumTokensMintedByHospitalId(@Param("hospitalId") UUID hospitalId);

    @Query(value = """
        SELECT m.* FROM mint_records m
        JOIN asset_deposits d ON d.asset_id = m.asset_id
        JOIN patients p ON p.id = d.patient_id
        WHERE p.hospital_id = :hospitalId
        ORDER BY m.timestamp DESC
        """, nativeQuery = true)
    List<MintRecord> findByHospitalIdOrderByTimestampDesc(@Param("hospitalId") UUID hospitalId);
}
