package com.SehatVault.SehatVaultBackend.audittrail.controller;

import com.SehatVault.SehatVaultBackend.audittrail.dto.AuditTrailLogDto;
import com.SehatVault.SehatVaultBackend.audittrail.service.AuditTrailService;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity/audit")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class AuditTrailController {

    private final AuditTrailService auditTrailService;
    private final UserRepository userRepository;

    @GetMapping("/patient-logs")
    public ResponseEntity<ApiResponse<List<AuditTrailLogDto>>> getPatientLogs(
            Authentication authentication,
            @RequestParam(defaultValue = "100") int limit) {

        UUID hospitalId = resolveHospitalId(authentication);
        List<AuditTrailLogDto> logs = auditTrailService.getPatientLogs(hospitalId, limit);
        return ResponseEntity.ok(ApiResponse.success("Patient audit logs loaded", logs));
    }

    @GetMapping("/hospital-logs")
    public ResponseEntity<ApiResponse<List<AuditTrailLogDto>>> getHospitalLogs(
            Authentication authentication,
            @RequestParam(defaultValue = "100") int limit) {

        UUID hospitalId = resolveHospitalId(authentication);
        List<AuditTrailLogDto> logs = auditTrailService.getHospitalLogs(hospitalId, limit);
        return ResponseEntity.ok(ApiResponse.success("Hospital audit logs loaded", logs));
    }

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
