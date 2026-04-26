package com.SehatVault.SehatVaultBackend.emergencyredemption.repository;

import com.SehatVault.SehatVaultBackend.emergencyredemption.entity.EmergencyRedemptionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmergencyRedemptionRequestRepository extends JpaRepository<EmergencyRedemptionRequest, UUID> {
    List<EmergencyRedemptionRequest> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    List<EmergencyRedemptionRequest> findByHospitalIdAndStatusOrderByCreatedAtAsc(UUID hospitalId, EmergencyRedemptionRequest.Status status);
}
