package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Các API quản trị dành cho quản trị viên")
public class AdminController {

        private final ApplicationService applicationService;

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
        public ResponseEntity<ApiResponse<Void>> updateApplicationStatus(
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
        public ResponseEntity<ApiResponse<Map<String, Long>>> getDashboardStatistics() {
                Map<String, Long> stats = applicationService.getApplicationStatistics();
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thống kê thành công", stats));
        }
}
