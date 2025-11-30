package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.AuthResponse;
import com.fixed_asset.patient_service.dto.LoginRequest;
import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private PatientRepository patientRepository;

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Patient patient = patientRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Patient not found with email: " + loginRequest.getEmail()));

        // In production, use proper password hashing (BCrypt)
        if (!patient.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = generateToken(patient);

        return new AuthResponse(
            token,
            patient.getId(),
            patient.getEmail(),
            patient.getName(),
            "Login successful"
        );
    }

    @Override
    public AuthResponse register(Patient patient) {
        if (patientRepository.existsByEmail(patient.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Generate registration ID if not provided
        if (patient.getRegistrationId() == null) {
            patient.setRegistrationId("PAT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        // In production, hash the password
        // patient.setPassword(passwordEncoder.encode(patient.getPassword()));

        Patient savedPatient = patientRepository.save(patient);
        String token = generateToken(savedPatient);

        return new AuthResponse(
            token,
            savedPatient.getId(),
            savedPatient.getEmail(),
            savedPatient.getName(),
            "Registration successful"
        );
    }

    @Override
    public boolean validateToken(String token) {
        // In production, use JWT validation
        // This is a simplified version for development
        return token != null && token.startsWith("pat_");
    }

    @Override
    public Long getPatientIdFromToken(String token) {
        // In production, decode JWT token
        // This is a simplified version for development
        if (token != null && token.startsWith("pat_")) {
            try {
                String idPart = token.substring(4).split("_")[0];
                return Long.parseLong(idPart);
            } catch (Exception e) {
                throw new RuntimeException("Invalid token format");
            }
        }
        throw new RuntimeException("Invalid token");
    }

    @Override
    public void logout(String token) {
        // In production, implement token blacklisting or session management
        // For now, just validate the token exists
        if (!validateToken(token)) {
            throw new RuntimeException("Invalid token");
        }
    }

    private String generateToken(Patient patient) {
        // In production, use JWT tokens with proper signing
        // This is a simplified version for development
        return "pat_" + patient.getId() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}