package com.SehatVault.SehatVaultBackend.report.controller;

import com.SehatVault.SehatVaultBackend.report.dto.GenerateReportRequest;
import com.SehatVault.SehatVaultBackend.report.dto.ReportDataDto;
import com.SehatVault.SehatVaultBackend.report.dto.ReportLogDto;
import com.SehatVault.SehatVaultBackend.report.service.ReportService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ReportLogDto>>> getHistory(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportHistory(authentication.getName())));
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<ReportDataDto>> generate(
            Authentication authentication, @RequestBody GenerateReportRequest request) {
        ReportDataDto data = reportService.generateReport(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Report generated", data));
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<ApiResponse<String>> delete(Authentication authentication, @PathVariable UUID reportId) {
        reportService.deleteReport(authentication.getName(), reportId);
        return ResponseEntity.ok(ApiResponse.success("Report deleted"));
    }
}
