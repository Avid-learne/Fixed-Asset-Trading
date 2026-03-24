package com.SehatVault.SehatVaultBackend.bankintegration.repository;

import com.SehatVault.SehatVaultBackend.bankintegration.entity.Partnership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface PartnershipRepository extends JpaRepository<Partnership, UUID> {

    List<Partnership> findByHospitalIdOrderByCreatedAtDesc(UUID hospitalId);

    List<Partnership> findByBankIdOrderByCreatedAtDesc(UUID bankId);

    boolean existsByHospitalIdAndBankIdAndIntegrationStatusIn(
            UUID hospitalId,
            UUID bankId,
            Set<Partnership.IntegrationStatus> statuses
    );

    Optional<Partnership> findByPartnershipIdAndHospitalId(UUID partnershipId, UUID hospitalId);

    Optional<Partnership> findByPartnershipIdAndBankId(UUID partnershipId, UUID bankId);

    Optional<Partnership> findFirstByHospitalIdAndIntegrationStatusOrderByCreatedAtDesc(
            UUID hospitalId,
            Partnership.IntegrationStatus integrationStatus
    );
}
