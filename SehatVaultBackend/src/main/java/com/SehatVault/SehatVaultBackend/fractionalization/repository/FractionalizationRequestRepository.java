package com.SehatVault.SehatVaultBackend.fractionalization.repository;

import com.SehatVault.SehatVaultBackend.fractionalization.entity.FractionalizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FractionalizationRequestRepository extends JpaRepository<FractionalizationRequest, UUID> {
    List<FractionalizationRequest> findByHospitalIdAndStatusOrderByCreatedAtAsc(UUID hospitalId, FractionalizationRequest.Status status);

    List<FractionalizationRequest> findByPrimaryPatientIdOrderByCreatedAtDesc(UUID primaryPatientId);
}
