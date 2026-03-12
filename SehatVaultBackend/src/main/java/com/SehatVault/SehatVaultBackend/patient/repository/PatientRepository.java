package com.SehatVault.SehatVaultBackend.patient.repository;

import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Patient entity
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    
    Optional<Patient> findByUserId(UUID userId);
    
    Optional<Patient> findByRegistrationId(String registrationId);
    
    boolean existsByUserId(UUID userId);
    
    List<Patient> findByHospitalId(UUID hospitalId);
}
