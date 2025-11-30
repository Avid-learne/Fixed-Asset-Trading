package com.fixed_asset.patient_service.controller;

import com.fixed_asset.patient_service.dto.DepositRequest;
import com.fixed_asset.patient_service.dto.DepositResponse;
import com.fixed_asset.patient_service.service.DepositService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/deposits")
public class DepositController {

    @Autowired
    private DepositService depositService;

    @PostMapping
    public ResponseEntity<DepositResponse> submitDeposit(
            @PathVariable Long patientId,
            @RequestBody DepositRequest depositRequest) {
        
        try {
            // Ensure the deposit request matches the path patient ID
            if (!patientId.equals(depositRequest.getPatientId())) {
                return ResponseEntity.badRequest().body(createErrorResponse("Patient ID in path and request body do not match"));
            }
            
            DepositResponse response = depositService.submitDeposit(depositRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<DepositResponse>> getPatientDeposits(@PathVariable Long patientId) {
        try {
            List<DepositResponse> deposits = depositService.getDepositsByPatientId(patientId);
            return ResponseEntity.ok(deposits);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{depositId}")
    public ResponseEntity<DepositResponse> getDepositById(
            @PathVariable Long patientId,
            @PathVariable Long depositId) {
        
        try {
            DepositResponse deposit = depositService.getDepositById(depositId);
            
            // Verify the deposit belongs to the patient
            if (!deposit.getPatientId().equals(patientId)) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(deposit);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DepositResponse>> getDepositsByStatus(
            @PathVariable Long patientId,
            @PathVariable String status) {
        
        try {
            List<DepositResponse> deposits = depositService.getDepositsByStatus(status.toUpperCase());
            return ResponseEntity.ok(deposits);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{depositId}/status")
    public ResponseEntity<DepositResponse> updateDepositStatus(
            @PathVariable Long patientId,
            @PathVariable Long depositId,
            @RequestParam String status,
            @RequestParam(required = false) String depositIdHash) {
        
        try {
            DepositResponse deposit = depositService.getDepositById(depositId);
            
            // Verify the deposit belongs to the patient
            if (!deposit.getPatientId().equals(patientId)) {
                return ResponseEntity.notFound().build();
            }
            
            DepositResponse updatedDeposit = depositService.updateDepositStatus(depositId, status.toUpperCase(), depositIdHash);
            return ResponseEntity.ok(updatedDeposit);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{depositId}/approve")
    public ResponseEntity<DepositResponse> approveDeposit(
            @PathVariable Long patientId,
            @PathVariable Long depositId,
            @RequestParam Double tokensToMint,
            @RequestParam String depositIdHash) {
        
        try {
            DepositResponse deposit = depositService.getDepositById(depositId);
            
            // Verify the deposit belongs to the patient
            if (!deposit.getPatientId().equals(patientId)) {
                return ResponseEntity.notFound().build();
            }
            
            boolean approved = depositService.approveDeposit(depositId, tokensToMint, depositIdHash);
            if (approved) {
                DepositResponse updatedDeposit = depositService.getDepositById(depositId);
                return ResponseEntity.ok(updatedDeposit);
            } else {
                return ResponseEntity.badRequest().body(createErrorResponse("Failed to approve deposit"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/{depositId}/reject")
    public ResponseEntity<DepositResponse> rejectDeposit(
            @PathVariable Long patientId,
            @PathVariable Long depositId,
            @RequestParam String reason) {
        
        try {
            DepositResponse deposit = depositService.getDepositById(depositId);
            
            // Verify the deposit belongs to the patient
            if (!deposit.getPatientId().equals(patientId)) {
                return ResponseEntity.notFound().build();
            }
            
            boolean rejected = depositService.rejectDeposit(depositId, reason);
            if (rejected) {
                DepositResponse updatedDeposit = depositService.getDepositById(depositId);
                return ResponseEntity.ok(updatedDeposit);
            } else {
                return ResponseEntity.badRequest().body(createErrorResponse("Failed to reject deposit"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/total-tokens")
    public ResponseEntity<Double> getTotalProcessedTokens(@PathVariable Long patientId) {
        try {
            Double totalTokens = depositService.getTotalProcessedTokens(patientId);
            return ResponseEntity.ok(totalTokens);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private DepositResponse createErrorResponse(String errorMessage) {
        DepositResponse errorResponse = new DepositResponse();
        errorResponse.setStatus("ERROR");
        errorResponse.setMetadata(errorMessage);
        return errorResponse;
    }
}