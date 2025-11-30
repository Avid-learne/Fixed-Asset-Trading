package com.fixed_asset.patient_service.repository;

import com.fixed_asset.patient_service.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByRegistrationId(String registrationId);
    Optional<Patient> findByWalletAddress(String walletAddress);
    boolean existsByEmail(String email);
    boolean existsByRegistrationId(String registrationId);

    @Query("SELECT p.healthTokenBalance FROM Patient p WHERE p.id = :patientId")
    Optional<Double> findHealthTokenBalanceByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT p.assetTokenBalance FROM Patient p WHERE p.id = :patientId")
    Optional<Double> findAssetTokenBalanceByPatientId(@Param("patientId") Long patientId);
}