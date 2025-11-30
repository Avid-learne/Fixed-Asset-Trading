package com.fixed_asset.patient_service.controller;

import com.fixed_asset.patient_service.dto.HealthBenefitDTO;
import com.fixed_asset.patient_service.dto.RedemptionRequest;
import com.fixed_asset.patient_service.dto.RedemptionResponse;
import com.fixed_asset.patient_service.service.BenefitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/benefits")
public class BenefitController {

    @Autowired
    private BenefitService benefitService;

    @GetMapping("/available")
    public ResponseEntity<List<HealthBenefitDTO>> getAvailableBenefits(@PathVariable Long patientId) {
        try {
            List<HealthBenefitDTO> benefits = benefitService.getAvailableBenefits(patientId);
            return ResponseEntity.ok(benefits);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/redeem")
    public ResponseEntity<RedemptionResponse> redeemBenefit(
            @PathVariable Long patientId,
            @RequestBody RedemptionRequest redemptionRequest) {
        
        try {
            // Ensure the redemption request matches the path patient ID
            if (!patientId.equals(redemptionRequest.getPatientId())) {
                return ResponseEntity.badRequest().body(createErrorResponse("Patient ID in path and request body do not match"));
            }
            
            RedemptionResponse response = benefitService.redeemBenefit(redemptionRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<RedemptionResponse>> getRedemptionHistory(@PathVariable Long patientId) {
        try {
            List<RedemptionResponse> history = benefitService.getRedemptionHistory(patientId);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/redemption/{redemptionId}")
    public ResponseEntity<RedemptionResponse> getRedemptionById(
            @PathVariable Long patientId,
            @PathVariable String redemptionId) {
        
        try {
            RedemptionResponse redemption = benefitService.getRedemptionById(redemptionId);
            
            // Verify the redemption belongs to the patient
            if (!redemption.getPatientId().equals(patientId)) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(redemption);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/redemption/{redemptionId}/approve")
    public ResponseEntity<String> approveRedemption(
            @PathVariable Long patientId,
            @PathVariable String redemptionId,
            @RequestParam String hospitalId) {
        
        try {
            RedemptionResponse redemption = benefitService.getRedemptionById(redemptionId);
            
            // Verify the redemption belongs to the patient
            if (!redemption.getPatientId().equals(patientId)) {
                return ResponseEntity.notFound().build();
            }
            
            boolean success = benefitService.approveRedemption(redemptionId, hospitalId);
            if (success) {
                return ResponseEntity.ok("Redemption approved successfully");
            } else {
                return ResponseEntity.badRequest().body("Failed to approve redemption");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to approve redemption: " + e.getMessage());
        }
    }

    @PostMapping("/redemption/{redemptionId}/complete")
    public ResponseEntity<String> completeRedemption(
            @PathVariable Long patientId,
            @PathVariable String redemptionId,
            @RequestParam String transactionHash) {
        
        try {
            RedemptionResponse redemption = benefitService.getRedemptionById(redemptionId);
            
            // Verify the redemption belongs to the patient
            if (!redemption.getPatientId().equals(patientId)) {
                return ResponseEntity.notFound().build();
            }
            
            boolean success = benefitService.completeRedemption(redemptionId, transactionHash);
            if (success) {
                return ResponseEntity.ok("Redemption completed successfully");
            } else {
                return ResponseEntity.badRequest().body("Failed to complete redemption");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to complete redemption: " + e.getMessage());
        }
    }

    @GetMapping("/total-redeemed")
    public ResponseEntity<Double> getTotalRedeemedHT(@PathVariable Long patientId) {
        try {
            Double totalRedeemed = benefitService.getTotalRedeemedHT(patientId);
            return ResponseEntity.ok(totalRedeemed);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/eligible-services")
    public ResponseEntity<List<String>> getEligibleServices(@PathVariable Long patientId) {
        try {
            List<HealthBenefitDTO> benefits = benefitService.getAvailableBenefits(patientId);
            List<String> eligibleServices = benefits.stream()
                    .filter(HealthBenefitDTO::getAvailable)
                    .map(HealthBenefitDTO::getServiceType)
                    .toList();
            return ResponseEntity.ok(eligibleServices);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private RedemptionResponse createErrorResponse(String errorMessage) {
        RedemptionResponse errorResponse = new RedemptionResponse();
        errorResponse.setStatus("ERROR");
        errorResponse.setMessage(errorMessage);
        return errorResponse;
    }
}