package com.SehatVault.SehatVaultBackend.marketplace.repository;

import com.SehatVault.SehatVaultBackend.marketplace.entity.PatientAtWithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientAtWithdrawalRequestRepository extends JpaRepository<PatientAtWithdrawalRequest, UUID> {

    /**
     * Find all withdrawal requests for a patient
     */
    List<PatientAtWithdrawalRequest> findByPatientId(UUID patientId);

    /**
     * Find pending withdrawal requests for a patient
     */
    @Query("SELECT p FROM PatientAtWithdrawalRequest p WHERE p.patientId = :patientId AND p.requestStatus = 'PENDING'")
    List<PatientAtWithdrawalRequest> findPendingRequestsByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find all requests for a specific trade
     */
    List<PatientAtWithdrawalRequest> findByTradeId(UUID tradeId);

    /**
     * Find active withdrawal requests for a patient (PENDING or APPROVED)
     */
    @Query("SELECT p FROM PatientAtWithdrawalRequest p WHERE p.patientId = :patientId AND (p.requestStatus = 'PENDING' OR p.requestStatus = 'APPROVED')")
    List<PatientAtWithdrawalRequest> findActiveRequestsByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find a pending request for a patient's specific asset in a trade
     */
    @Query("SELECT p FROM PatientAtWithdrawalRequest p WHERE p.patientId = :patientId AND p.assetId = :assetId AND p.tradeId = :tradeId AND p.requestStatus = 'PENDING'")
    Optional<PatientAtWithdrawalRequest> findPendingRequestByPatientAssetAndTrade(@Param("patientId") UUID patientId,
            @Param("assetId") UUID assetId, @Param("tradeId") UUID tradeId);

    /**
     * Find approved requests ready to be processed (trade must be completed)
     */
    @Query("SELECT p FROM PatientAtWithdrawalRequest p WHERE p.requestStatus = 'APPROVED' AND p.tradeRemainingTimeDays <= 0")
    List<PatientAtWithdrawalRequest> findReadyToProcessRequests();

    /**
     * Count active withdrawal requests for a trade
     */
    @Query("SELECT COUNT(p) FROM PatientAtWithdrawalRequest p WHERE p.tradeId = :tradeId AND (p.requestStatus = 'PENDING' OR p.requestStatus = 'APPROVED')")
    int countActiveRequestsForTrade(@Param("tradeId") UUID tradeId);
}
