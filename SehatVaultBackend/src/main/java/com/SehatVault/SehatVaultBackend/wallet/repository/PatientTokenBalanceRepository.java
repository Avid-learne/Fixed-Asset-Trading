package com.SehatVault.SehatVaultBackend.wallet.repository;

import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PatientTokenBalanceRepository extends JpaRepository<PatientTokenBalance, UUID> {
    Optional<PatientTokenBalance> findByPatientId(UUID patientId);
}
