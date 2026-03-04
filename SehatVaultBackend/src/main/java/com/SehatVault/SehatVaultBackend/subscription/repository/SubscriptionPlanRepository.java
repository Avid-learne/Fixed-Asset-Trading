package com.SehatVault.SehatVaultBackend.subscription.repository;

import com.SehatVault.SehatVaultBackend.subscription.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for SubscriptionPlan entity
 */
@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID> {
    
    List<SubscriptionPlan> findByIsActiveTrue();
    
    List<SubscriptionPlan> findByHospitalId(UUID hospitalId);
}
