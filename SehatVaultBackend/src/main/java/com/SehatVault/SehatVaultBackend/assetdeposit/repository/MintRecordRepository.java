package com.SehatVault.SehatVaultBackend.assetdeposit.repository;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.MintRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.UUID;

public interface MintRecordRepository extends JpaRepository<MintRecord, UUID> {

    @Query("""
        SELECT COALESCE(SUM(m.tokensMinted), 0)
        FROM MintRecord m
        WHERE m.assetId = :assetId
          AND UPPER(m.status) <> 'FAILED'
        """)
    BigDecimal sumTokensMintedByAssetId(@Param("assetId") UUID assetId);
}
