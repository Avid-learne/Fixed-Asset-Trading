package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.PatientDTO;
import com.fixed_asset.patient_service.model.Patient;

import java.util.List;

public interface PatientService {
    Patient registerPatient(Patient patient);
    PatientDTO getPatientById(Long id);
    PatientDTO getPatientByEmail(String email);
    PatientDTO getPatientByRegistrationId(String registrationId);
    List<PatientDTO> getAllPatients();
    Patient updatePatient(Long id, Patient patientDetails);
    void deletePatient(Long id);
    PatientDTO updateTokenBalances(Long patientId, Double assetTokenBalance, Double healthTokenBalance);
    boolean existsByEmail(String email);
    boolean existsByRegistrationId(String registrationId);
}