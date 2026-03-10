package com.SehatVault.SehatVaultBackend.profile.controller;

import com.SehatVault.SehatVaultBackend.profile.dto.ProfileResponse;
import com.SehatVault.SehatVaultBackend.profile.dto.ProfileUpdateRequest;
import com.SehatVault.SehatVaultBackend.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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

            String email = authentication.getName();
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
