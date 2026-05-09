package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ApplicationRepository applicationRepository;

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<Application>>> getAllApplications() {
        return ResponseEntity.ok(
                ApiResponse.<List<Application>>builder()
                        .success(true)
                        .message("Lấy danh sách hồ sơ thành công")
                        .data(applicationRepository.findAll())
                        .build());
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<ApiResponse<Application>> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ số " + id));

        application.setStatus(status);
        applicationRepository.save(application);

        return ResponseEntity.ok(
                ApiResponse.<Application>builder()
                        .success(true)
                        .message("Cập nhật trạng thái hồ sơ thành công")
                        .data(application)
                        .build());
    }
}