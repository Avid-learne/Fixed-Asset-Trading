package com.SehatVault.SehatVaultBackend.dashboard.controller;

import com.SehatVault.SehatVaultBackend.dashboard.dto.AssetPricesDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.BankDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.HospitalDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.SuperAdminBankDetailsDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.SuperAdminDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.SuperAdminHospitalDetailsDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.PatientDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.dashboard.service.AssetPricingService;
import com.SehatVault.SehatVaultBackend.dashboard.service.DashboardService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AssetPricingService assetPricingService;

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

    @GetMapping("/super-admin")
    public ResponseEntity<ApiResponse<SuperAdminDashboardSummaryDto>> getSuperAdminDashboard(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSuperAdminSummary(authentication.getName())));
    }

    @GetMapping("/super-admin/hospitals/{hospitalId}")
    public ResponseEntity<ApiResponse<SuperAdminHospitalDetailsDto>> getSuperAdminHospitalDetails(
            Authentication authentication,
            @PathVariable UUID hospitalId
    ) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSuperAdminHospitalDetails(authentication.getName(), hospitalId)));
    }

    @GetMapping("/super-admin/banks/{bankId}")
    public ResponseEntity<ApiResponse<SuperAdminBankDetailsDto>> getSuperAdminBankDetails(
            Authentication authentication,
            @PathVariable UUID bankId
    ) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSuperAdminBankDetails(authentication.getName(), bankId)));
    }

    @GetMapping({"/hospital/asset-prices", "/asset-prices"})
    public ResponseEntity<ApiResponse<AssetPricesDto>> getAssetPrices(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(assetPricingService.getLiveAssetPrices()));
    }

    @PutMapping("/hospital/asset-prices")
    public ResponseEntity<ApiResponse<AssetPricesDto>> updateAssetPrices(
            Authentication authentication, @RequestBody AssetPricesDto prices) {
        return ResponseEntity.ok(ApiResponse.success("Prices updated", dashboardService.updateAssetPrices(authentication.getName(), prices)));
    }
}
