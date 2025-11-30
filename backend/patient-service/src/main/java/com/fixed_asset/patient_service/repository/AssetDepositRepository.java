package com.fixed_asset.patient_service.repository;

import com.fixed_asset.patient_service.model.AssetDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetDepositRepository extends JpaRepository<AssetDeposit, Long> {
    List<AssetDeposit> findByPatientId(Long patientId);
    Optional<AssetDeposit> findByDepositId(String depositId);
    List<AssetDeposit> findByStatus(String status);
    
    @Query("SELECT ad FROM AssetDeposit ad WHERE ad.patient.id = :patientId AND ad.status = :status")
    List<AssetDeposit> findByPatientIdAndStatus(@Param("patientId") Long patientId, @Param("status") String status);
    
    @Query("SELECT COALESCE(SUM(ad.tokensMinted), 0) FROM AssetDeposit ad WHERE ad.patient.id = :patientId AND ad.status = 'PROCESSED'")
    Double sumProcessedTokensByPatientId(@Param("patientId") Long patientId);
}