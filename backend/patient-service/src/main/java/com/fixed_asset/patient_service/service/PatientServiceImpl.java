package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.PatientDTO;
import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Override
    public Patient registerPatient(Patient patient) {
        if (existsByEmail(patient.getEmail())) {
            throw new RuntimeException("Patient with email " + patient.getEmail() + " already exists");
        }
        if (existsByRegistrationId(patient.getRegistrationId())) {
            throw new RuntimeException("Patient with registration ID " + patient.getRegistrationId() + " already exists");
        }
        return patientRepository.save(patient);
    }

    @Override
    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        return convertToDTO(patient);
    }

    @Override
    public PatientDTO getPatientByEmail(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found with email: " + email));
        return convertToDTO(patient);
    }

    @Override
    public PatientDTO getPatientByRegistrationId(String registrationId) {
        Patient patient = patientRepository.findByRegistrationId(registrationId)
                .orElseThrow(() -> new RuntimeException("Patient not found with registration ID: " + registrationId));
        return convertToDTO(patient);
    }

    @Override
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        patient.setName(patientDetails.getName());
        patient.setPhone(patientDetails.getPhone());
        patient.setAddress(patientDetails.getAddress());
        patient.setWalletAddress(patientDetails.getWalletAddress());

        return patientRepository.save(patient);
    }

    @Override
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        patientRepository.delete(patient);
    }

    @Override
    public PatientDTO updateTokenBalances(Long patientId, Double assetTokenBalance, Double healthTokenBalance) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        patient.setAssetTokenBalance(assetTokenBalance);
        patient.setHealthTokenBalance(healthTokenBalance);

        Patient updatedPatient = patientRepository.save(patient);
        return convertToDTO(updatedPatient);
    }

    @Override
    public boolean existsByEmail(String email) {
        return patientRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByRegistrationId(String registrationId) {
        return patientRepository.existsByRegistrationId(registrationId);
    }

    private PatientDTO convertToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setRegistrationId(patient.getRegistrationId());
        dto.setName(patient.getName());
        dto.setEmail(patient.getEmail());
        dto.setPhone(patient.getPhone());
        dto.setAddress(patient.getAddress());
        dto.setWalletAddress(patient.getWalletAddress());
        dto.setAssetTokenBalance(patient.getAssetTokenBalance());
        dto.setHealthTokenBalance(patient.getHealthTokenBalance());
        dto.setCreatedAt(patient.getCreatedAt());
        return dto;
    }
}