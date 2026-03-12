package com.SehatVault.SehatVaultBackend.hospital.repository;

import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Hospital Repository
 * Data access layer for Hospital entity
 */
@Repository
public interface HospitalRepository extends JpaRepository<Hospital, UUID> {
    
    /**
     * Find hospital by hospital name
     * @param hospitalName Name of the hospital
     * @return Optional containing hospital if found
     */
    Optional<Hospital> findByHospitalName(String hospitalName);
    
    /**
     * Find hospital by hospital code
     * @param code Hospital code
     * @return Optional containing hospital if found
     */
    Optional<Hospital> findByCode(String code);
}
