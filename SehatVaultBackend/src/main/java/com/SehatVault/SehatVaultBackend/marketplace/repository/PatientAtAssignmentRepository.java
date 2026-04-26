package com.SehatVault.SehatVaultBackend.marketplace.repository;

import com.SehatVault.SehatVaultBackend.marketplace.entity.PatientAtAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientAtAssignmentRepository extends JpaRepository<PatientAtAssignment, UUID> {

    /**
     * Find assignments for a specific patient
     */
    List<PatientAtAssignment> findByPatientId(UUID patientId);

    /**
     * Find assignments for a patient in a specific hospital
     */
    List<PatientAtAssignment> findByPatientIdAndHospitalId(UUID patientId, UUID hospitalId);

    /**
     * Find assignment for a patient's specific asset
     */
    Optional<PatientAtAssignment> findByPatientIdAndAssetId(UUID patientId, UUID assetId);

    /**
     * Find all available AT for a patient
     */
    @Query("SELECT p FROM PatientAtAssignment p WHERE p.patientId = :patientId AND p.availabilityStatus = 'AVAILABLE'")
    List<PatientAtAssignment> findAvailableAtByPatientId(@Param("patientId") UUID patientId);

        @Query("SELECT p FROM PatientAtAssignment p WHERE p.patientId = :patientId AND p.hospitalId = :hospitalId AND p.availabilityStatus = 'AVAILABLE' ORDER BY p.createdAt ASC")
        List<PatientAtAssignment> findAvailableAtByPatientIdAndHospitalIdOldestFirst(
            @Param("patientId") UUID patientId,
            @Param("hospitalId") UUID hospitalId
        );

    /**
     * Find all unavailable AT for a patient
     */
    @Query("SELECT p FROM PatientAtAssignment p WHERE p.patientId = :patientId AND p.availabilityStatus = 'UNAVAILABLE'")
    List<PatientAtAssignment> findUnavailableAtByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find assignments by hospital
     */
    List<PatientAtAssignment> findByHospitalId(UUID hospitalId);

    /**
     * Find assignments for a hospital's patients
     */
    @Query("SELECT p FROM PatientAtAssignment p WHERE p.hospitalId = :hospitalId AND p.availabilityStatus = 'AVAILABLE'")
    List<PatientAtAssignment> findAvailableAtForHospital(@Param("hospitalId") UUID hospitalId);
}
