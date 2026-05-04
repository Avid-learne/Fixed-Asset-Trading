package com.SehatVault.SehatVaultBackend.assetdeposit.repository;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface AssetDepositRepository extends JpaRepository<AssetDeposit, UUID> {

        @Query(value = """
                        SELECT b.bank_id
                        FROM banks b
                        ORDER BY b.created_at ASC
                        LIMIT 1
                        """, nativeQuery = true)
        UUID findAnyBankId();

        @Query(value = """
                        SELECT ad.*
                        FROM asset_deposits ad
                        JOIN patients p ON p.id = ad.patient_id
                        WHERE p.hospital_id = :hospitalId
                        ORDER BY ad.submitted_at DESC
                        """, nativeQuery = true)
        List<AssetDeposit> findAllByHospitalId(@Param("hospitalId") UUID hospitalId);

        /**
         * Find all asset deposits for a specific patient
         */
        List<AssetDeposit> findByPatientId(UUID patientId);

        @Query(value = """
                        SELECT COUNT(*)
                        FROM asset_deposits ad
                        JOIN patients p ON p.id = ad.patient_id
                        WHERE ad.bank_id = :bankId
                          AND p.hospital_id = :hospitalId
                        """, nativeQuery = true)
        long countByBankIdAndHospitalId(@Param("bankId") UUID bankId, @Param("hospitalId") UUID hospitalId);

        @Query(value = """
                        SELECT COUNT(*)
                        FROM asset_deposits ad
                        JOIN patients p ON p.id = ad.patient_id
                        WHERE ad.bank_id = :bankId
                          AND p.hospital_id = :hospitalId
                          AND lower(ad.status) = lower(:status)
                        """, nativeQuery = true)
        long countByBankIdAndHospitalIdAndStatus(
                        @Param("bankId") UUID bankId,
                        @Param("hospitalId") UUID hospitalId,
                        @Param("status") String status);

        @Query(value = """
                        SELECT COUNT(*)
                        FROM asset_deposits ad
                        JOIN patients p ON p.id = ad.patient_id
                        WHERE ad.bank_id = :bankId
                          AND p.hospital_id = :hospitalId
                          AND ad.custody_confirmed_at IS NOT NULL
                        """, nativeQuery = true)
        long countByBankIdAndHospitalIdAndCustodyConfirmedAtIsNotNull(
                        @Param("bankId") UUID bankId,
                        @Param("hospitalId") UUID hospitalId);

        @Query(value = """
                        SELECT COALESCE(SUM(ad.asset_value), 0)
                        FROM asset_deposits ad
                        JOIN patients p ON p.id = ad.patient_id
                        WHERE ad.bank_id = :bankId
                          AND p.hospital_id = :hospitalId
                        """, nativeQuery = true)
        BigDecimal sumAssetValueByBankIdAndHospitalId(
                        @Param("bankId") UUID bankId,
                        @Param("hospitalId") UUID hospitalId);

        @Query(value = """
                        SELECT COALESCE(SUM(ad.asset_value), 0)
                        FROM asset_deposits ad
                        JOIN patients p ON p.id = ad.patient_id
                        WHERE ad.bank_id = :bankId
                          AND p.hospital_id = :hospitalId
                          AND ad.custody_confirmed_at IS NOT NULL
                        """, nativeQuery = true)
        BigDecimal sumAssetValueByBankIdAndHospitalIdAndCustodyConfirmedAtIsNotNull(
                        @Param("bankId") UUID bankId,
                        @Param("hospitalId") UUID hospitalId);

        @Query(value = """
                        SELECT COALESCE(SUM(ad.asset_value), 0)
                        FROM asset_deposits ad
                        JOIN patients p ON p.id = ad.patient_id
                        WHERE ad.bank_id = :bankId
                          AND p.hospital_id = :hospitalId
                          AND lower(ad.status) = lower(:status)
                        """, nativeQuery = true)
        BigDecimal sumAssetValueByBankIdAndHospitalIdAndStatus(
                        @Param("bankId") UUID bankId,
                        @Param("hospitalId") UUID hospitalId,
                        @Param("status") String status);

        @Query(value = """
                        SELECT COUNT(*)
                        FROM asset_deposits ad
                        JOIN patients p ON p.id = ad.patient_id
                        WHERE p.hospital_id = :hospitalId
                          AND ad.custody_confirmed_at IS NOT NULL
                        """, nativeQuery = true)
        long countByHospitalIdAndCustodyConfirmedAtIsNotNull(@Param("hospitalId") UUID hospitalId);

        @Query(value = """
                        SELECT COALESCE(SUM(ad.asset_value), 0)
                        FROM asset_deposits ad
                        JOIN patients p ON p.id = ad.patient_id
                        WHERE p.hospital_id = :hospitalId
                          AND ad.custody_confirmed_at IS NOT NULL
                        """, nativeQuery = true)
        BigDecimal sumAssetValueByHospitalIdAndCustodyConfirmedAtIsNotNull(@Param("hospitalId") UUID hospitalId);

        @Query(value = """
                        SELECT COUNT(*)
                        FROM asset_deposits ad
                        WHERE ad.bank_id = :bankId
                          AND ad.custody_confirmed_at IS NOT NULL
                        """, nativeQuery = true)
        long countByBankIdAndCustodyConfirmedAtIsNotNull(@Param("bankId") UUID bankId);

        @Query(value = """
                        SELECT COALESCE(SUM(ad.asset_value), 0)
                        FROM asset_deposits ad
                        WHERE ad.bank_id = :bankId
                          AND ad.custody_confirmed_at IS NOT NULL
                        """, nativeQuery = true)
        BigDecimal sumAssetValueByBankIdAndCustodyConfirmedAtIsNotNull(@Param("bankId") UUID bankId);

        List<AssetDeposit> findByPatientIdOrderBySubmittedAtDesc(UUID patientId);

        List<AssetDeposit> findByBankIdOrderBySubmittedAtDesc(UUID bankId);

        List<AssetDeposit> findByStatusIgnoreCase(String status);
}
