package com.SehatVault.SehatVaultBackend.subscription.controller;

import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.subscription.dto.*;
import com.SehatVault.SehatVaultBackend.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Subscription Management
 * Handles subscription-related endpoints for patients and hospital admins
 */
@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    /**
     * Get all active subscription plans
     * GET /api/subscriptions/plans
     */
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanDto>>> getAllPlans() {
        List<SubscriptionPlanDto> plans = subscriptionService.getAllActivePlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    /**
     * Get patient's active subscription
     * GET /api/subscriptions/patient/{userId}
     */
    @GetMapping("/patient/{userId}")
    public ResponseEntity<ApiResponse<PatientSubscriptionDto>> getPatientSubscription(
            @PathVariable UUID userId) {
        PatientSubscriptionDto subscription = subscriptionService.getPatientActiveSubscription(userId);
        
        if (subscription == null) {
            return ResponseEntity.ok(ApiResponse.success("No active subscription", null));
        }
        
        return ResponseEntity.ok(ApiResponse.success(subscription));
    }

    /**
     * Subscribe patient to a plan
     * POST /api/subscriptions/subscribe
     */
    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<PatientSubscriptionDto>> subscribe(
            @RequestBody SubscribeRequest request) {
        ApiResponse<PatientSubscriptionDto> response = subscriptionService.subscribePatient(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get payment history for a patient
     * GET /api/subscriptions/payment-history/{userId}
     */
    @GetMapping("/payment-history/{userId}")
    public ResponseEntity<ApiResponse<List<PaymentHistoryDto>>> getPaymentHistory(
            @PathVariable UUID userId) {
        List<PaymentHistoryDto> history = subscriptionService.getPaymentHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    /**
     * Cancel patient subscription
     * DELETE /api/subscriptions/cancel/{userId}
     */
    @DeleteMapping("/cancel/{userId}")
    public ResponseEntity<ApiResponse<String>> cancelSubscription(
            @PathVariable UUID userId) {
        ApiResponse<String> response = subscriptionService.cancelSubscription(userId);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ─── Hospital admin plan management ───────────────────────────────────────

    /**
     * List plans for the authenticated hospital admin
     * GET /api/subscriptions/admin/plans
     */
    @GetMapping("/admin/plans")
    public ResponseEntity<?> getAdminPlans(Authentication authentication) {
        try {
            UUID hospitalId = resolveHospitalId(authentication);
            List<SubscriptionPlanDto> plans = subscriptionService.getHospitalPlans(hospitalId);
            return ResponseEntity.ok(ApiResponse.success(plans));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Server error: " + e.getMessage()));
        }
    }

    /**
     * Create a new subscription plan
     * POST /api/subscriptions/admin/plans
     */
    @PostMapping("/admin/plans")
    public ResponseEntity<?> createPlan(Authentication authentication, @RequestBody UpsertPlanRequest request) {
        try {
            UUID hospitalId = resolveHospitalId(authentication);
            SubscriptionPlanDto plan = subscriptionService.createPlan(hospitalId, request);
            return ResponseEntity.ok(ApiResponse.success("Plan created", plan));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Server error: " + e.getMessage()));
        }
    }

    /**
     * Update an existing subscription plan
     * PUT /api/subscriptions/admin/plans/{subsId}
     */
    @PutMapping("/admin/plans/{subsId}")
    public ResponseEntity<?> updatePlan(Authentication authentication,
                                        @PathVariable UUID subsId,
                                        @RequestBody UpsertPlanRequest request) {
        try {
            UUID hospitalId = resolveHospitalId(authentication);
            SubscriptionPlanDto plan = subscriptionService.updatePlan(hospitalId, subsId, request);
            return ResponseEntity.ok(ApiResponse.success("Plan updated", plan));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Server error: " + e.getMessage()));
        }
    }

    /**
     * Deactivate a subscription plan
     * DELETE /api/subscriptions/admin/plans/{subsId}
     */
    @DeleteMapping("/admin/plans/{subsId}")
    public ResponseEntity<?> deactivatePlan(Authentication authentication, @PathVariable UUID subsId) {
        try {
            UUID hospitalId = resolveHospitalId(authentication);
            subscriptionService.deactivatePlan(hospitalId, subsId);
            return ResponseEntity.ok(ApiResponse.success("Plan deactivated", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Server error: " + e.getMessage()));
        }
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private UUID resolveHospitalId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthorized");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getHospitalId() == null) {
            throw new IllegalArgumentException("No hospital linked to this account");
        }
        return user.getHospitalId();
    }
}
