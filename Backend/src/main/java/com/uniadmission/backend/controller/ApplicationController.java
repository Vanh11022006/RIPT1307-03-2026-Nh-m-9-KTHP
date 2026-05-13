package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.Attachment;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.AttachmentRepository;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final FileService fileService;
    private final AttachmentRepository attachmentRepository;
    private final ApplicationRepository applicationRepository;

    @PostMapping("/{id}/upload")
    public ResponseEntity<ApiResponse<Void>> uploadAttachments(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {

        Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ ID: " + id));

        files.forEach(file -> {
            String fileName = fileService.storeFile(file);
            Attachment attachment = Attachment.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .filePath(fileName)
                    .application(application)
                    .build();
            attachmentRepository.save(java.util.Objects.requireNonNull(attachment));
        });

        return ResponseEntity.ok(new ApiResponse<>(true, "Upload " + files.size() + " files thành công", null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Application>> submitApplication(@RequestBody ApplicationSubmitRequest request) {
        Application application = applicationService.submit(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Submit application success", application));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<ApiResponse<List<Application>>> getApplicationsByCandidate(@PathVariable Long candidateId) {
        List<Application> apps = applicationService.getApplicationsByCandidate(candidateId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Get applications success", apps));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelApplication(@PathVariable("id") Long id) {
        applicationService.cancelApplication(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cancel application success", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Application>>> getAll() {
        List<Application> apps = applicationService.getAllApplications();
        return ResponseEntity.ok(new ApiResponse<>(true, "Get all applications success", apps));
    }

    @PutMapping("/admin-update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> payload) {

        ApplicationStatus status = ApplicationStatus.valueOf(payload.get("status").toString().toUpperCase());
        String notes = payload.containsKey("notes") ? payload.get("notes").toString() : null;
        Long adminId = Long.valueOf(payload.getOrDefault("adminId", 1).toString());

        applicationService.updateApplicationStatus(id, status, notes, adminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Update status success", null));
    }

    @GetMapping("/admin-list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<Application>>> getAdminApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Application> applications = applicationService.getApplicationsForAdmin(status, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hồ sơ thành công", applications));
    }

    @GetMapping("/admin-statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStatistics() {
        Map<String, Long> stats = applicationService.getApplicationStatistics();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thống kê thành công", stats));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Application>> getApplicationDetail(@PathVariable Long id) {
        Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ"));

        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết hồ sơ thành công", application));
    }
}
