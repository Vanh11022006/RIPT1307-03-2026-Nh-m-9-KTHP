package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.request.AdminBulkEmailRequest;
import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.dto.response.statistics.ApplicationStatisticsResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.UserRepository;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Các API quản trị dành cho quản trị viên")
public class AdminController {

        private final ApplicationService applicationService;
        private final ApplicationRepository applicationRepository;
        private final EmailService emailService;
        private final UserRepository userRepository;

        @GetMapping("/applications")
        @Operation(summary = "Danh sách hồ sơ cho admin", description = "Lấy danh sách hồ sơ có phân trang và lọc theo trạng thái, trường, ngành và đợt")
        public ResponseEntity<ApiResponse<Page<Application>>> getAllApplications(
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false) Long universityId,
                        @RequestParam(required = false) Long majorId,
                        @RequestParam(required = false) Long admissionRoundId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                ApplicationStatus parsedStatus = null;
                if (status != null && !status.trim().isEmpty()) {
                        parsedStatus = ApplicationStatus.valueOf(status.trim().toUpperCase());
                }

                Page<Application> applications = applicationService.getApplicationsForAdmin(parsedStatus,
                                universityId, majorId, admissionRoundId, page, size);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hồ sơ thành công", applications));
        }

        @PutMapping("/applications/{id}/status")
        @Operation(summary = "Cập nhật trạng thái hồ sơ", description = "Admin cập nhật trạng thái hồ sơ từ trang quản trị")
        @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "AdminStatusExample", value = "{\"status\":\"APPROVED\",\"notes\":\"Đủ điều kiện\",\"adminId\":1}")))
        public ResponseEntity<ApiResponse<com.uniadmission.backend.dto.response.ApplicationResponse>> updateApplicationStatus(
                        @PathVariable Long id,
                        @RequestBody Map<String, Object> payload) {

                ApplicationStatus status = ApplicationStatus.valueOf(payload.get("status").toString().toUpperCase());
                String notes = payload.containsKey("notes") ? payload.get("notes").toString() : null;
                Long adminId = Long.valueOf(payload.getOrDefault("adminId", 1).toString());

                applicationService.updateApplicationStatus(id, status, notes, adminId);
                return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái hồ sơ thành công", null));
        }

        @GetMapping("/statistics/dashboard")
        @Operation(summary = "Thống kê dashboard", description = "Lấy số liệu tổng quan cho trang quản trị")
        public ResponseEntity<ApiResponse<ApplicationStatisticsResponse>> getDashboardStatistics(
                        @RequestParam(required = false) Long universityId,
                        @RequestParam(required = false) Long majorId,
                        @RequestParam(required = false) Long admissionRoundId) {
                ApplicationStatisticsResponse stats = applicationService.getApplicationStatistics(universityId, majorId,
                                admissionRoundId);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thống kê thành công", stats));
        }

        @PostMapping("/bulk-email")
        @Operation(summary = "Gửi email hàng loạt", description = "Admin gửi email tùy chỉnh đến các thí sinh theo danh sách hồ sơ đã chọn")
        @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = AdminBulkEmailRequest.class), examples = @ExampleObject(name = "AdminBulkEmailExample", value = "{\"applicationIds\":[1,2,3],\"subject\":\"Thông báo từ UniAdmission\",\"message\":\"Kính gửi thí sinh, ...\",\"html\":false,\"adminId\":1}")))
        public ResponseEntity<ApiResponse<Map<String, Object>>> sendBulkEmail(
                        @RequestBody AdminBulkEmailRequest request) {
                if (request.getApplicationIds() == null || request.getApplicationIds().isEmpty()) {
                        throw new RuntimeException("Danh sách hồ sơ nhận email không được để trống");
                }
                if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
                        throw new RuntimeException("Tiêu đề email không được để trống");
                }
                if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                        throw new RuntimeException("Nội dung email không được để trống");
                }

                Set<Long> requestedIds = new LinkedHashSet<>(request.getApplicationIds());
                List<Application> applications = applicationRepository.findAllById(requestedIds);
                Map<Long, String> applicationEmails = new LinkedHashMap<>();
                for (Application application : applications) {
                        if (application == null || application.getCandidate() == null
                                        || application.getCandidate().getUser() == null) {
                                continue;
                        }
                        String email = application.getCandidate().getUser().getEmail();
                        if (email != null && !email.trim().isEmpty()) {
                                applicationEmails.put(application.getId(), email.trim());
                        }
                }

                Set<String> uniqueRecipients = new LinkedHashSet<>(applicationEmails.values());
                List<Long> skippedApplicationIds = new ArrayList<>();
                for (Long applicationId : requestedIds) {
                        if (!applicationEmails.containsKey(applicationId)) {
                                skippedApplicationIds.add(applicationId);
                        }
                }

                if (uniqueRecipients.isEmpty()) {
                        throw new RuntimeException("Không tìm thấy người nhận email hợp lệ trong danh sách hồ sơ");
                }

                for (String recipient : uniqueRecipients) {
                        emailService.sendCustomEmail(recipient, request.getSubject().trim(), request.getMessage(),
                                        request.isHtml());
                }

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("requestedApplicationCount", requestedIds.size());
                result.put("recipientCount", uniqueRecipients.size());
                result.put("skippedApplicationIds", skippedApplicationIds);
                result.put("html", request.isHtml());
                result.put("adminId", request.getAdminId());

                return ResponseEntity.ok(new ApiResponse<>(true, "Gửi email hàng loạt thành công", result));
        }

        @GetMapping("/users")
        @Operation(summary = "Danh sách người dùng", description = "Lấy toàn bộ danh sách tài khoản trong hệ thống")
        public ResponseEntity<ApiResponse<java.util.List<com.uniadmission.backend.entity.User>>> getAllUsers() {
                java.util.List<com.uniadmission.backend.entity.User> users = userRepository.findAll();
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách người dùng thành công", users));
        }

        @PutMapping("/users/{id}/role")
        @Operation(summary = "Cập nhật vai trò người dùng", description = "Admin thay đổi role của một tài khoản")
        public ResponseEntity<ApiResponse<Void>> updateUserRole(
                        @PathVariable Long id,
                        @RequestBody java.util.Map<String, String> payload) {
                String newRole = payload.get("role");
                if (newRole == null || newRole.trim().isEmpty()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Role không được để trống", null));
                }
                com.uniadmission.backend.entity.User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng id=" + id));
                user.setRole(newRole.trim().toLowerCase());
                userRepository.save(user);
                return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật role thành công", null));
        }

        @PutMapping("/users/{id}/status")
        @Operation(summary = "Kích hoạt / khóa tài khoản", description = "Admin thay đổi trạng thái active/inactive của một tài khoản")
        public ResponseEntity<ApiResponse<Void>> updateUserStatus(
                        @PathVariable Long id,
                        @RequestBody java.util.Map<String, String> payload) {
                String newStatus = payload.get("status");
                if (newStatus == null || newStatus.trim().isEmpty()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Status không được để trống", null));
                }
                com.uniadmission.backend.entity.User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng id=" + id));
                user.setStatus(newStatus.trim().toLowerCase());
                userRepository.save(user);
                return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái thành công", null));
        }
}
