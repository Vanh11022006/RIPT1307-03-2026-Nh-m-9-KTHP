package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.NotificationLog;
import com.uniadmission.backend.service.NotificationLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationLogController {

    private final NotificationLogService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getUserNotifications(@PathVariable Long userId) {
        List<NotificationLog> logs = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(new ApiResponse(true, "Success", logs));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<ApiResponse> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationLog> logs = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(new ApiResponse(true, "Success", logs));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse(true, "Success", null));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(new ApiResponse(true, "Success", null));
    }
}