package com.fixed_asset.patient_service.repository;

import com.fixed_asset.patient_service.model.TokenTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenTransactionRepository extends JpaRepository<TokenTransaction, Long> {
    List<TokenTransaction> findByPatientId(Long patientId);
    Optional<TokenTransaction> findByTransactionHash(String transactionHash);
    List<TokenTransaction> findByTokenType(String tokenType);
    List<TokenTransaction> findByPatientIdAndTokenType(Long patientId, String tokenType);
    List<TokenTransaction> findByTransactionType(String transactionType);
    
    @Query("SELECT tt FROM TokenTransaction tt WHERE tt.patient.id = :patientId AND tt.status = :status ORDER BY tt.createdAt DESC")
    List<TokenTransaction> findByPatientIdAndStatus(@Param("patientId") Long patientId, @Param("status") String status);
    
    @Query("SELECT SUM(tt.amount) FROM TokenTransaction tt WHERE tt.patient.id = :patientId AND tt.tokenType = :tokenType AND tt.transactionType = 'MINT'")
    Double sumMintedTokensByPatientAndType(@Param("patientId") Long patientId, @Param("tokenType") String tokenType);
}