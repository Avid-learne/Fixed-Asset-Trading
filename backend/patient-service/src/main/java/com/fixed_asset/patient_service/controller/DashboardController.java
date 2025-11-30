package com.fixed_asset.patient_service.controller;

import com.fixed_asset.patient_service.dto.HealthBenefitDTO;
import com.fixed_asset.patient_service.dto.RedemptionResponse;
import com.fixed_asset.patient_service.dto.TokenBalanceDTO;
import com.fixed_asset.patient_service.dto.DepositResponse;
import com.fixed_asset.patient_service.service.BenefitService;
import com.fixed_asset.patient_service.service.DepositService;
import com.fixed_asset.patient_service.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients/{patientId}/dashboard")
public class DashboardController {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private DepositService depositService;

    @Autowired
    private BenefitService benefitService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable Long patientId) {
        Map<String, Object> dashboard = new HashMap<>();

        // Get token balances
        TokenBalanceDTO tokenBalance = tokenService.getTokenBalance(patientId);
        dashboard.put("tokenBalances", tokenBalance);

        // Get recent deposits
        List<DepositResponse> recentDeposits = depositService.getDepositsByPatientId(patientId);
        dashboard.put("recentDeposits", recentDeposits.subList(0, Math.min(recentDeposits.size(), 5)));

        // Get available benefits
        List<HealthBenefitDTO> availableBenefits = benefitService.getAvailableBenefits(patientId);
        dashboard.put("availableBenefits", availableBenefits);

        // Get redemption history
        List<RedemptionResponse> redemptionHistory = benefitService.getRedemptionHistory(patientId);
        dashboard.put("redemptionHistory", redemptionHistory.subList(0, Math.min(redemptionHistory.size(), 5)));

        // Get statistics
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDeposits", recentDeposits.size());
        stats.put("pendingDeposits", recentDeposits.stream().filter(d -> "PENDING".equals(d.getStatus())).count());
        stats.put("totalRedemptions", redemptionHistory.size());
        stats.put("completedRedemptions", redemptionHistory.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count());
        
        dashboard.put("statistics", stats);

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@PathVariable Long patientId) {
        Map<String, Object> summary = new HashMap<>();

        // Token balances
        TokenBalanceDTO tokenBalance = tokenService.getTokenBalance(patientId);
        summary.put("assetTokens", tokenBalance.getAssetTokenBalance());
        summary.put("healthTokens", tokenBalance.getHealthTokenBalance());

        // Deposit summary
        List<DepositResponse> allDeposits = depositService.getDepositsByPatientId(patientId);
        long pendingDeposits = allDeposits.stream().filter(d -> "PENDING".equals(d.getStatus())).count();
        long approvedDeposits = allDeposits.stream().filter(d -> "APPROVED".equals(d.getStatus())).count();
        
        summary.put("totalDeposits", allDeposits.size());
        summary.put("pendingDeposits", pendingDeposits);
        summary.put("approvedDeposits", approvedDeposits);

        // Redemption summary
        List<RedemptionResponse> allRedemptions = benefitService.getRedemptionHistory(patientId);
        long pendingRedemptions = allRedemptions.stream().filter(r -> "PENDING".equals(r.getStatus())).count();
        long completedRedemptions = allRedemptions.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
        
        summary.put("totalRedemptions", allRedemptions.size());
        summary.put("pendingRedemptions", pendingRedemptions);
        summary.put("completedRedemptions", completedRedemptions);

        return ResponseEntity.ok(summary);
    }
}