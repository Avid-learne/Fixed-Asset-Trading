package com.SehatVault.SehatVaultBackend.healthcard.controller;

import com.SehatVault.SehatVaultBackend.healthcard.dto.HealthCardDto;
import com.SehatVault.SehatVaultBackend.healthcard.service.HealthCardService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Health Card Management
 * Handles health card-related endpoints
 */
@RestController
@RequestMapping("/api/health-cards")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class HealthCardController {

    private final HealthCardService healthCardService;

    /**
     * Get all health cards for a patient by user ID
     * GET /api/health-cards/patient/{userId}
     */
    @GetMapping("/patient/{userId}")
    public ResponseEntity<ApiResponse<List<HealthCardDto>>> getPatientHealthCards(
            @PathVariable UUID userId) {
        List<HealthCardDto> healthCards = healthCardService.getPatientHealthCards(userId);
        return ResponseEntity.ok(ApiResponse.success(healthCards));
    }

    /**
     * Get health cards by type for a patient
     * GET /api/health-cards/patient/{userId}/type/{cardType}
     */
    @GetMapping("/patient/{userId}/type/{cardType}")
    public ResponseEntity<ApiResponse<List<HealthCardDto>>> getPatientHealthCardsByType(
            @PathVariable UUID userId,
            @PathVariable String cardType) {
        List<HealthCardDto> healthCards = healthCardService.getPatientHealthCardsByType(userId, cardType);
        return ResponseEntity.ok(ApiResponse.success(healthCards));
    }

    /**
     * Get active health cards for a patient
     * GET /api/health-cards/patient/{userId}/active
     */
    @GetMapping("/patient/{userId}/active")
    public ResponseEntity<ApiResponse<List<HealthCardDto>>> getActiveHealthCards(
            @PathVariable UUID userId) {
        List<HealthCardDto> healthCards = healthCardService.getActiveHealthCards(userId);
        return ResponseEntity.ok(ApiResponse.success(healthCards));
    }
}
