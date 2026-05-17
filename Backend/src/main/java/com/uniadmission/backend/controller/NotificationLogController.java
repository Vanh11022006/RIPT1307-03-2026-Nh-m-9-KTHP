package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.NotificationLog;
import com.uniadmission.backend.service.NotificationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationLogController {

    private final NotificationLogService notificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationLog>> createNotification(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String title = payload.get("title") != null ? payload.get("title").toString() : "Thông báo";
        String message = payload.get("message") != null ? payload.get("message").toString() : "";

        NotificationLog log = notificationService.createNotification(userId, title, message);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", log));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getUserNotifications(@PathVariable Long userId) {
        List<NotificationLog> logs = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", logs));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationLog> logs = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", logs));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", null));
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications(@PathVariable Long userId) {
        notificationService.deleteNotificationsByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", null));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", null));
    }
}
