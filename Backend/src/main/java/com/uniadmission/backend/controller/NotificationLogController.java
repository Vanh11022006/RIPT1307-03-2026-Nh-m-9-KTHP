package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.NotificationLog;
import com.uniadmission.backend.service.NotificationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Quản lý thông báo của người dùng")
public class NotificationLogController {

    private final NotificationLogService notificationService;

    @PostMapping
    @Operation(summary = "Tạo thông báo", description = "Tạo một thông báo mới cho user")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "NotificationCreateExample", value = "{\"userId\":1,\"title\":\"Thông báo mới\",\"message\":\"Bạn có một cập nhật hồ sơ mới\"}")))
    public ResponseEntity<ApiResponse<NotificationLog>> createNotification(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String title = payload.get("title") != null ? payload.get("title").toString() : "Thông báo";
        String message = payload.get("message") != null ? payload.get("message").toString() : "";

        NotificationLog log = notificationService.createNotification(userId, title, message);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", log));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Danh sách thông báo", description = "Lấy toàn bộ thông báo của một user")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getUserNotifications(@PathVariable Long userId) {
        List<NotificationLog> logs = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", logs));
    }

    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "Thông báo chưa đọc", description = "Lấy danh sách thông báo chưa đọc của user")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationLog> logs = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", logs));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Đánh dấu đã đọc", description = "Đánh dấu một thông báo là đã đọc")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thông báo", description = "Xóa thông báo theo id")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", null));
    }

    @DeleteMapping("/user/{userId}")
    @Operation(summary = "Xóa toàn bộ thông báo", description = "Xóa toàn bộ thông báo của một user")
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications(@PathVariable Long userId) {
        notificationService.deleteNotificationsByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", null));
    }

    @PutMapping("/user/{userId}/read-all")
    @Operation(summary = "Đánh dấu tất cả đã đọc", description = "Đánh dấu toàn bộ thông báo của user là đã đọc")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", null));
    }
}
