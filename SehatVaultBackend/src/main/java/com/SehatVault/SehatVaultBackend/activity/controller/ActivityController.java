package com.SehatVault.SehatVaultBackend.activity.controller;

import com.SehatVault.SehatVaultBackend.activity.dto.ActivityLogDto;
import com.SehatVault.SehatVaultBackend.activity.dto.ActivityTransactionDto;
import com.SehatVault.SehatVaultBackend.activity.service.ActivityService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/patient/{userId}/transactions")
    public ResponseEntity<ApiResponse<List<ActivityTransactionDto>>> getPatientTransactions(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getPatientTransactions(userId)));
    }

    @GetMapping("/patient/{userId}/logs")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getPatientActivityLogs(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getPatientActivityLogs(userId)));
    }
}
