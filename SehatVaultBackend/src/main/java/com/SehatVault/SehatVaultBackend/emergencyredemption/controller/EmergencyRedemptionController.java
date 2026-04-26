package com.SehatVault.SehatVaultBackend.emergencyredemption.controller;

import com.SehatVault.SehatVaultBackend.emergencyredemption.dto.ApproveEmergencyRedemptionRequest;
import com.SehatVault.SehatVaultBackend.emergencyredemption.dto.CreateEmergencyRedemptionRequest;
import com.SehatVault.SehatVaultBackend.emergencyredemption.dto.EmergencyRedemptionDto;
import com.SehatVault.SehatVaultBackend.emergencyredemption.dto.RejectEmergencyRedemptionRequest;
import com.SehatVault.SehatVaultBackend.emergencyredemption.service.EmergencyRedemptionService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/emergency-redemptions")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
public class EmergencyRedemptionController {

    private final EmergencyRedemptionService emergencyRedemptionService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmergencyRedemptionDto>> submit(
            Authentication authentication,
            @RequestBody CreateEmergencyRedemptionRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        EmergencyRedemptionDto dto = emergencyRedemptionService.submit(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/patient/{patientUserId}")
    public ResponseEntity<ApiResponse<List<EmergencyRedemptionDto>>> listForPatient(@PathVariable UUID patientUserId) {
        return ResponseEntity.ok(ApiResponse.success(emergencyRedemptionService.listForPatient(patientUserId)));
    }

    @GetMapping("/hospital/pending")
    public ResponseEntity<ApiResponse<List<EmergencyRedemptionDto>>> listPendingForHospital(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(emergencyRedemptionService.listPendingForHospitalStaff(authentication.getName())));
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<EmergencyRedemptionDto>> approve(
            Authentication authentication,
            @PathVariable UUID requestId,
            @RequestBody ApproveEmergencyRedemptionRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        EmergencyRedemptionDto dto = emergencyRedemptionService.approve(authentication.getName(), requestId, request);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse<EmergencyRedemptionDto>> reject(
            Authentication authentication,
            @PathVariable UUID requestId,
            @RequestBody RejectEmergencyRedemptionRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        EmergencyRedemptionDto dto = emergencyRedemptionService.reject(authentication.getName(), requestId, request);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
