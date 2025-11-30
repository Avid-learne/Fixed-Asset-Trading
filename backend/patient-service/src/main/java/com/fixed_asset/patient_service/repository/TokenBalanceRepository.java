package com.fixed_asset.patient_service.repository;

import com.fixed_asset.patient_service.model.TokenBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenBalanceRepository extends JpaRepository<TokenBalance, Long> {
    Optional<TokenBalance> findByPatientId(Long patientId);
    boolean existsByPatientId(Long patientId);
    
    @Modifying
    @Query("UPDATE TokenBalance tb SET tb.assetTokenBalance = tb.assetTokenBalance + :amount WHERE tb.patient.id = :patientId")
    void incrementAssetTokenBalance(@Param("patientId") Long patientId, @Param("amount") Double amount);
    
    @Modifying
    @Query("UPDATE TokenBalance tb SET tb.assetTokenBalance = tb.assetTokenBalance - :amount WHERE tb.patient.id = :patientId AND tb.assetTokenBalance >= :amount")
    int decrementAssetTokenBalance(@Param("patientId") Long patientId, @Param("amount") Double amount);
    
    @Modifying
    @Query("UPDATE TokenBalance tb SET tb.healthTokenBalance = tb.healthTokenBalance + :amount WHERE tb.patient.id = :patientId")
    void incrementHealthTokenBalance(@Param("patientId") Long patientId, @Param("amount") Double amount);
    
    @Modifying
    @Query("UPDATE TokenBalance tb SET tb.healthTokenBalance = tb.healthTokenBalance - :amount WHERE tb.patient.id = :patientId AND tb.healthTokenBalance >= :amount")
    int decrementHealthTokenBalance(@Param("patientId") Long patientId, @Param("amount") Double amount);
}