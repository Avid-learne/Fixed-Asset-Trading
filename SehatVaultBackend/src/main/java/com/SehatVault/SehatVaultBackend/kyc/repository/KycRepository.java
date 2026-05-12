package com.SehatVault.SehatVaultBackend.kyc.repository;

import com.SehatVault.SehatVaultBackend.kyc.entity.Kyc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface KycRepository extends JpaRepository<Kyc, UUID> {
    Optional<Kyc> findByPatientId(UUID patientId);
}
