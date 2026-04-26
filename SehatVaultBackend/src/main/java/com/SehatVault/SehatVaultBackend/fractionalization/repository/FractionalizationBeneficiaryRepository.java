package com.SehatVault.SehatVaultBackend.fractionalization.repository;

import com.SehatVault.SehatVaultBackend.fractionalization.entity.FractionalizationBeneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FractionalizationBeneficiaryRepository extends JpaRepository<FractionalizationBeneficiary, UUID> {
    List<FractionalizationBeneficiary> findByRequestId(UUID requestId);
}
