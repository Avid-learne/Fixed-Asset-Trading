package com.SehatVault.SehatVaultBackend.activity.controller;

import com.SehatVault.SehatVaultBackend.activity.dto.ActivityLogDto;
import com.SehatVault.SehatVaultBackend.activity.dto.ActivityNotificationDto;
import com.SehatVault.SehatVaultBackend.activity.dto.ActivityTransactionDto;
import com.SehatVault.SehatVaultBackend.activity.dto.SendNotificationRequest;
import com.SehatVault.SehatVaultBackend.activity.dto.SendNotificationResponse;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.activity.service.ActivityService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;
    private final UserRepository userRepository;

    @GetMapping("/patient/{userId}/transactions")
    public ResponseEntity<ApiResponse<List<ActivityTransactionDto>>> getPatientTransactions(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getPatientTransactions(userId)));
    }

    @GetMapping("/patient/{userId}/notifications")
    public ResponseEntity<ApiResponse<List<ActivityNotificationDto>>> getPatientNotifications(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getPatientNotifications(userId)));
    }

    @GetMapping("/user/{userId}/notifications")
    public ResponseEntity<ApiResponse<List<ActivityNotificationDto>>> getUserNotifications(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getUserNotifications(userId)));
    }

    @GetMapping("/user/{userId}/notifications/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(@PathVariable UUID userId) {
        Map<String, Long> payload = new HashMap<>();
        payload.put("unreadCount", activityService.getUnreadCount(userId));
        return ResponseEntity.ok(ApiResponse.success(payload));
    }

    @PatchMapping("/user/{userId}/notifications/{notificationId}/read")
    public ResponseEntity<ApiResponse<String>> markNotificationAsRead(
            @PathVariable UUID userId,
            @PathVariable UUID notificationId) {
        activityService.markNotificationAsRead(userId, notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PatchMapping("/user/{userId}/notifications/read-all")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead(@PathVariable UUID userId) {
        int updated = activityService.markAllNotificationsAsRead(userId);
        Map<String, Integer> payload = new HashMap<>();
        payload.put("updated", updated);
        return ResponseEntity.ok(ApiResponse.success(payload));
    }

    @PostMapping("/notifications/send")
    public ResponseEntity<ApiResponse<SendNotificationResponse>> sendNotification(
            Authentication authentication,
            @RequestBody SendNotificationRequest request) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        User sender = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        SendNotificationResponse result = activityService.sendNotification(sender.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Notification sent", result));
    }

    @GetMapping("/patient/{userId}/logs")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> getPatientActivityLogs(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getPatientActivityLogs(userId)));
    }
}
