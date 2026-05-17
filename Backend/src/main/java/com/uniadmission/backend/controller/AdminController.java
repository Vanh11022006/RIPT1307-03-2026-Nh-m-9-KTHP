package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.service.ApplicationService;
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
public class AdminController {

        private final ApplicationService applicationService;

        @GetMapping("/applications")
        public ResponseEntity<ApiResponse<Page<Application>>> getAllApplications(
                        @RequestParam(required = false) ApplicationStatus status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Page<Application> applications = applicationService.getApplicationsForAdmin(status, page, size);
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hồ sơ thành công", applications));
        }

        @PutMapping("/applications/{id}/status")
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
        public ResponseEntity<ApiResponse<Map<String, Long>>> getDashboardStatistics() {
                Map<String, Long> stats = applicationService.getApplicationStatistics();
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thống kê thành công", stats));
        }
}
