package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.AuthResponse;
import com.fixed_asset.patient_service.dto.LoginRequest;
import com.fixed_asset.patient_service.model.Patient;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse register(Patient patient);
    boolean validateToken(String token);
    Long getPatientIdFromToken(String token);
    void logout(String token);
}