package com.SehatVault.SehatVaultBackend.notification.controller;

import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.notification.dto.DeleteNotificationsRequest;
import com.SehatVault.SehatVaultBackend.notification.dto.NotificationDto;
import com.SehatVault.SehatVaultBackend.notification.dto.SendNotificationRequest;
import com.SehatVault.SehatVaultBackend.notification.dto.SendNotificationResponse;
import com.SehatVault.SehatVaultBackend.notification.service.NotificationService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/notifications")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // ─── READ ───────────────────────────────────────────

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getReceived(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(userId)));
    }

    @GetMapping("/user/{userId}/sent")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getSent(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getSentNotifications(userId)));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(@PathVariable UUID userId) {
        Map<String, Long> payload = new HashMap<>();
        payload.put("unreadCount", notificationService.getUnreadCount(userId));
        return ResponseEntity.ok(ApiResponse.success(payload));
    }

    // ─── MARK READ ──────────────────────────────────────

    @PatchMapping("/user/{userId}/{notificationId}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @PathVariable UUID userId, @PathVariable UUID notificationId) {
        notificationService.markAsRead(userId, notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead(@PathVariable UUID userId) {
        int updated = notificationService.markAllAsRead(userId);
        Map<String, Integer> payload = new HashMap<>();
        payload.put("updated", updated);
        return ResponseEntity.ok(ApiResponse.success(payload));
    }

    // ─── DELETE ──────────────────────────────────────────

    @DeleteMapping("/user/{userId}/{notificationId}/received")
    public ResponseEntity<ApiResponse<String>> deleteReceived(
            @PathVariable UUID userId, @PathVariable UUID notificationId) {
        notificationService.deleteReceivedNotification(userId, notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted"));
    }

    @DeleteMapping("/user/{userId}/{notificationId}/sent")
    public ResponseEntity<ApiResponse<String>> deleteSent(
            @PathVariable UUID userId, @PathVariable UUID notificationId) {
        notificationService.deleteSentNotification(userId, notificationId);
        return ResponseEntity.ok(ApiResponse.success("Sent notification deleted"));
    }

    @PostMapping("/user/{userId}/delete-selected/received")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> deleteSelectedReceived(
            @PathVariable UUID userId, @RequestBody DeleteNotificationsRequest request) {
        int deleted = notificationService.deleteSelectedReceivedNotifications(userId, request.getNotificationIds());
        Map<String, Integer> payload = new HashMap<>();
        payload.put("deleted", deleted);
        return ResponseEntity.ok(ApiResponse.success("Selected notifications deleted", payload));
    }

    @PostMapping("/user/{userId}/delete-selected/sent")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> deleteSelectedSent(
            @PathVariable UUID userId, @RequestBody DeleteNotificationsRequest request) {
        int deleted = notificationService.deleteSelectedSentNotifications(userId, request.getNotificationIds());
        Map<String, Integer> payload = new HashMap<>();
        payload.put("deleted", deleted);
        return ResponseEntity.ok(ApiResponse.success("Selected sent notifications deleted", payload));
    }

    @DeleteMapping("/user/{userId}/received")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> deleteAllReceived(@PathVariable UUID userId) {
        int deleted = notificationService.deleteAllReceivedNotifications(userId);
        Map<String, Integer> payload = new HashMap<>();
        payload.put("deleted", deleted);
        return ResponseEntity.ok(ApiResponse.success("All received notifications deleted", payload));
    }

    @DeleteMapping("/user/{userId}/sent")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> deleteAllSent(@PathVariable UUID userId) {
        int deleted = notificationService.deleteAllSentNotifications(userId);
        Map<String, Integer> payload = new HashMap<>();
        payload.put("deleted", deleted);
        return ResponseEntity.ok(ApiResponse.success("All sent notifications deleted", payload));
    }

    // ─── SEND ───────────────────────────────────────────

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<SendNotificationResponse>> send(
            Authentication authentication, @RequestBody SendNotificationRequest request) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        User sender = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        SendNotificationResponse result = notificationService.send(sender.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Notification sent", result));
    }
}
