package com.fixed_asset.patient_service.repository;

import com.fixed_asset.patient_service.model.BenefitRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BenefitRedemptionRepository extends JpaRepository<BenefitRedemption, Long> {
    List<BenefitRedemption> findByPatientId(Long patientId);
    Optional<BenefitRedemption> findByRedemptionId(String redemptionId);
    List<BenefitRedemption> findByStatus(String status);
    List<BenefitRedemption> findByPatientIdAndStatus(Long patientId, String status);
    
    @Query("SELECT SUM(br.htAmount) FROM BenefitRedemption br WHERE br.patient.id = :patientId AND br.status = 'COMPLETED'")
    Double sumRedeemedHTByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT COUNT(br) FROM BenefitRedemption br WHERE br.patient.id = :patientId AND br.serviceType = :serviceType")
    Long countRedemptionsByPatientAndServiceType(@Param("patientId") Long patientId, @Param("serviceType") String serviceType);
}