package com.SehatVault.SehatVaultBackend.healthcard.repository;

import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for HealthCard entity
 */
@Repository
public interface HealthCardRepository extends JpaRepository<HealthCard, UUID> {
    
    /**
     * Find all health cards by patient ID
     */
    List<HealthCard> findByPatientId(UUID patientId);
    
    /**
     * Find health card by card number
     */
    Optional<HealthCard> findByCardNum(String cardNum);
    
    /**
     * Find health cards by patient ID and card type
     */
    List<HealthCard> findByPatientIdAndCardId(UUID patientId, UUID cardId);
    
    /**
     * Check if health card exists by card number
     */
    boolean existsByCardNum(String cardNum);
}
