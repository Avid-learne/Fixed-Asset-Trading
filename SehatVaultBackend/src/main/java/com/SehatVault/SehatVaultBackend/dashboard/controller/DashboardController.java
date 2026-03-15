package com.SehatVault.SehatVaultBackend.dashboard.controller;

import com.SehatVault.SehatVaultBackend.dashboard.dto.BankDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.HospitalDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.PatientDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.dashboard.service.DashboardService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/patient")
    public ResponseEntity<ApiResponse<PatientDashboardSummaryDto>> getPatientDashboard(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getPatientSummary(authentication.getName())));
    }

    @GetMapping("/bank")
    public ResponseEntity<ApiResponse<BankDashboardSummaryDto>> getBankDashboard(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getBankSummary(authentication.getName())));
    }

    @GetMapping("/hospital")
    public ResponseEntity<ApiResponse<HospitalDashboardSummaryDto>> getHospitalDashboard(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getHospitalSummary(authentication.getName())));
    }
}
