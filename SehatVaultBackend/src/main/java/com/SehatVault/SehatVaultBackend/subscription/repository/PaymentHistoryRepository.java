package com.SehatVault.SehatVaultBackend.subscription.repository;

import com.SehatVault.SehatVaultBackend.subscription.entity.PaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for PaymentHistory entity
 */
@Repository
public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, UUID> {
    
    List<PaymentHistory> findByPatientIdOrderByTimestampDesc(UUID patientId);
    
    List<PaymentHistory> findByPatientIdAndStatus(UUID patientId, PaymentHistory.PaymentStatus status);
}
