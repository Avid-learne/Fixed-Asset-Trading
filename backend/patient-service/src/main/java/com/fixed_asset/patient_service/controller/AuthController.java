package com.fixed_asset.patient_service.controller;

import com.fixed_asset.patient_service.dto.AuthResponse;
import com.fixed_asset.patient_service.dto.LoginRequest;
import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody Patient patient) {
        try {
            AuthResponse response = authService.register(patient);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage("Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage("Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        try {
            // Extract token from "Bearer {token}" format
            String actualToken = extractToken(token);
            authService.logout(actualToken);
            return ResponseEntity.ok("Logged out successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Logout failed: " + e.getMessage());
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        try {
            String actualToken = extractToken(token);
            boolean isValid = authService.validateToken(actualToken);
            return ResponseEntity.ok(isValid);
        } catch (RuntimeException e) {
            return ResponseEntity.ok(false);
        }
    }

    @GetMapping("/patient-id")
    public ResponseEntity<Long> getPatientIdFromToken(@RequestHeader("Authorization") String token) {
        try {
            String actualToken = extractToken(token);
            Long patientId = authService.getPatientIdFromToken(actualToken);
            return ResponseEntity.ok(patientId);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return authorizationHeader;
    }
}