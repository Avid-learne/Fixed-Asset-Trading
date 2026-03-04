package com.SehatVault.SehatVaultBackend.subscription.controller;

import com.SehatVault.SehatVaultBackend.subscription.dto.*;
import com.SehatVault.SehatVaultBackend.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for Subscription Management
 * Handles subscription-related endpoints for patients
 */
@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

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
}
