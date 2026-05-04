package com.SehatVault.SehatVaultBackend.profile.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.SehatVault.SehatVaultBackend.profile.dto.ProfileResponse;
import com.SehatVault.SehatVaultBackend.profile.dto.ProfileUpdateRequest;
import com.SehatVault.SehatVaultBackend.profile.service.ProfileService;

import lombok.RequiredArgsConstructor;

/**
 * Profile Controller
 * Handles user profile operations
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileController {

    private final ProfileService profileService;

    /**
     * Get current user's profile
     * GET /api/profile
     */
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(createErrorResponse("Unauthorized"));
            }

            // Extract userId from authentication principal if needed
            // For now, we'll need the frontend to pass userId or we extract from JWT
            
            return ResponseEntity.ok(createSuccessResponse("Profile retrieved successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(createErrorResponse("Error retrieving profile: " + e.getMessage()));
        }
    }

    /**
     * Get profile by user ID
     * GET /api/profile/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfileById(@PathVariable UUID userId) {
        try {
            ProfileResponse profile = profileService.getProfile(userId);
            return ResponseEntity.ok(createSuccessResponse("Profile retrieved successfully", profile));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(createErrorResponse("Error retrieving profile: " + e.getMessage()));
        }
    }

    /**
     * Get all patients
     * GET /api/profile/hospital/patients
     */
    @GetMapping("/hospital/patients")
    public ResponseEntity<?> getAllPatients() {
        try {
            List<ProfileResponse> patients = profileService.getAllPatients();
            return ResponseEntity.ok(createSuccessResponse("Patients retrieved successfully", patients));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(createErrorResponse("Error retrieving patients: " + e.getMessage()));
        }
    }

    /**
     * Get patients by hospital ID
     * GET /api/profile/hospital/{hospitalId}/patients
     */
    @GetMapping("/hospital/{hospitalId}/patients")
    public ResponseEntity<?> getPatientsByHospital(@PathVariable UUID hospitalId) {
        try {
            List<ProfileResponse> patients = profileService.getPatientsByHospitalId(hospitalId);
            return ResponseEntity.ok(createSuccessResponse("Patients retrieved successfully", patients));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(createErrorResponse("Error retrieving patients: " + e.getMessage()));
        }
    }

    /**
     * Update user profile
     * PUT /api/profile/{userId}
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable UUID userId,
            @RequestBody ProfileUpdateRequest request) {
        try {
            if (!request.hasValidName()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Name is required"));
            }

            ProfileResponse updatedProfile = profileService.updateProfile(userId, request);
            return ResponseEntity.ok(createSuccessResponse("Profile updated successfully", updatedProfile));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(createErrorResponse("Error updating profile: " + e.getMessage()));
        }
    }

    /**
     * Update wallet address
     * PUT /api/profile/{userId}/wallet
     */
    @PutMapping("/{userId}/wallet")
    public ResponseEntity<?> updateWalletAddress(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> request) {
        try {
            String walletAddress = request.get("walletAddress");
            if (walletAddress == null || walletAddress.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Wallet address is required"));
            }

            profileService.updateWalletAddress(userId, walletAddress);
            return ResponseEntity.ok(createSuccessResponse("Wallet address updated successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(createErrorResponse("Error updating wallet address: " + e.getMessage()));
        }
    }

    /**
     * Get current patient's KYC status
     * GET /api/profile/kyc/status
     */
    @GetMapping("/kyc/status")
    public ResponseEntity<?> getKycStatus(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(createErrorResponse("Unauthorized"));
            }

            String status = profileService.getKycStatus(authentication.getName()).name();
            Map<String, Object> data = new HashMap<>();
            data.put("status", status);
            return ResponseEntity.ok(createSuccessResponse("KYC status retrieved successfully", data));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(createErrorResponse("Error retrieving KYC status: " + e.getMessage()));
        }
    }

    /**
     * Submit current patient's KYC for review
     * POST /api/profile/kyc/submit
     */
    @PostMapping("/kyc/submit")
    public ResponseEntity<?> submitKyc(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(createErrorResponse("Unauthorized"));
            }

            String status = profileService.submitKyc(authentication.getName()).name();
            Map<String, Object> data = new HashMap<>();
            data.put("status", status);
            return ResponseEntity.ok(createSuccessResponse("KYC submitted successfully", data));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(createErrorResponse("Error submitting KYC: " + e.getMessage()));
        }
    }

    /**
     * Review a patient's KYC submission
     * POST /api/profile/kyc/review/{userId}
     */
    @PostMapping("/kyc/review/{userId}")
    public ResponseEntity<?> reviewKyc(
            Authentication authentication,
            @PathVariable UUID userId,
            @RequestBody Map<String, Object> request) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(createErrorResponse("Unauthorized"));
            }

            boolean approved = request != null && Boolean.parseBoolean(String.valueOf(request.getOrDefault("approved", false)));
            String reason = request != null && request.get("reason") != null ? String.valueOf(request.get("reason")) : null;
            String status = profileService.reviewKyc(authentication.getName(), userId, approved, reason).name();
            Map<String, Object> data = new HashMap<>();
            data.put("status", status);
            return ResponseEntity.ok(createSuccessResponse("KYC review saved successfully", data));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(createErrorResponse("Error reviewing KYC: " + e.getMessage()));
        }
    }

    // Helper methods for response formatting
    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        if (data != null) {
            response.put("data", data);
        }
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
