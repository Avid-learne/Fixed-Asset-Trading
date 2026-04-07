package com.SehatVault.SehatVaultBackend.subscription.repository;

import com.SehatVault.SehatVaultBackend.subscription.entity.PatientSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for PatientSubscription entity
 */
@Repository
public interface PatientSubscriptionRepository extends JpaRepository<PatientSubscription, UUID> {
    
    Optional<PatientSubscription> findByPatientIdAndStatus(UUID patientId, PatientSubscription.SubscriptionStatus status);
    
    List<PatientSubscription> findByPatientId(UUID patientId);

    List<PatientSubscription> findByStatus(PatientSubscription.SubscriptionStatus status);
    
    boolean existsByPatientIdAndStatus(UUID patientId, PatientSubscription.SubscriptionStatus status);
}
