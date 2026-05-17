package com.uniadmission.backend.controller;

import java.util.stream.Collectors;
import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.dto.response.ApplicationResponse;
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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import java.util.Map;

@RestController
@Slf4j
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
    public ResponseEntity<ApiResponse<ApplicationResponse>> submitApplication(
            @RequestBody ApplicationSubmitRequest request) {
        log.info("Received submitApplication request payload: {}", request);
        log.info("Received submitApplication request, scores={}", request.getScores());
        Application application = applicationService.submit(request);
        ApplicationResponse resp = mapToResponse(application);
        return ResponseEntity.ok(new ApiResponse<>(true, "Submit application success", resp));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplicationsByCandidate(
            @PathVariable Long candidateId) {
        List<Application> apps = applicationService.getApplicationsByCandidate(candidateId);
        List<ApplicationResponse> resp = apps.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Get applications success", resp));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelApplication(@PathVariable("id") Long id) {
        applicationService.cancelApplication(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cancel application success", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getAll() {
        List<Application> apps = applicationService.getAllApplications();
        List<ApplicationResponse> resp = apps.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Get all applications success", resp));
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

    @PutMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updatePriority(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> payload) {

        String priorityGroup = payload.containsKey("priorityGroup") ? payload.get("priorityGroup").toString() : null;
        Double priorityScore = payload.containsKey("priorityScore") && payload.get("priorityScore") != null
                ? Double.valueOf(payload.get("priorityScore").toString())
                : null;
        Long adminId = payload.containsKey("adminId") ? Long.valueOf(payload.get("adminId").toString()) : 1L;

        applicationService.updateApplicationPriority(id, priorityGroup, priorityScore, adminId);

        return ResponseEntity.ok(new ApiResponse<>(true, "Update priority success", null));
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
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationDetail(@PathVariable Long id) {
        Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ"));

        ApplicationResponse resp = mapToResponse(application);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết hồ sơ thành công", resp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateApplication(@PathVariable Long id,
            @RequestBody ApplicationSubmitRequest request) {
        log.info("Received updateApplication id={}, payload={}", id, request);
        Application updated = applicationService.updateApplication(id, request);
        ApplicationResponse resp = mapToResponse(updated);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật hồ sơ thành công", resp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa hồ sơ thành công", null));
    }

    private ApplicationResponse mapToResponse(Application application) {
        if (application == null)
            return null;
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.Map<String, Double> parsedScores = new java.util.HashMap<>();
        try {
            if (application.getScores() != null && !application.getScores().trim().isEmpty()
                    && !"null".equalsIgnoreCase(application.getScores().trim())) {
                java.util.Map<String, Double> temp = mapper.readValue(application.getScores(),
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Double>>() {
                        });
                if (temp != null) {
                    parsedScores.putAll(temp);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse scores JSON for application id={}: {}", application.getId(), e.getMessage());
            // keep parsedScores as empty map
        }

        java.util.List<java.util.Map<String, Object>> evidence = new java.util.ArrayList<>();
        try {
            java.util.List<com.uniadmission.backend.entity.Attachment> atts = attachmentRepository
                    .findByApplication_Id(application.getId());
            atts.forEach(att -> {
                String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/uploads/")
                        .path(att.getFilePath() != null ? att.getFilePath() : "")
                        .toUriString();
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("id", att.getId());
                m.put("fileName", att.getFileName());
                m.put("fileUrl", fileUrl);
                m.put("fileType", att.getFileType());
                m.put("fileSize", null);
                evidence.add(m);
            });
        } catch (Exception ex) {
            // ignore
        }

        return ApplicationResponse.builder()
                .id(application.getId())
                .candidateId(application.getCandidate() != null ? application.getCandidate().getId() : null)
                .majorId(application.getMajor() != null ? application.getMajor().getId() : null)
                .majorName(application.getMajor() != null ? application.getMajor().getName() : null)
                .universityId(application.getMajor() != null && application.getMajor().getUniversity() != null
                        ? application.getMajor().getUniversity().getId()
                        : null)
                .applicationCode(application.getApplicationCode())
                .admissionRoundId(
                        application.getAdmissionRound() != null ? application.getAdmissionRound().getId() : null)
                .admissionRoundName(
                        application.getAdmissionRound() != null ? application.getAdmissionRound().getName() : null)
                .subjectGroupId(application.getSubjectGroup() != null ? application.getSubjectGroup().getId() : null)
                .subjectGroupName(
                        application.getSubjectGroup() != null ? application.getSubjectGroup().getName() : null)
                .subjectGroupCode(
                        application.getSubjectGroup() != null ? application.getSubjectGroup().getCode() : null)
                .totalScore(application.getTotalScore())
                .priorityGroup(application.getPriorityGroup())
                .priorityScore(application.getPriorityScore())
                .scores(parsedScores)
                .evidenceFiles(evidence)
                .submittedAt(
                        application.getSubmissionDate() != null ? application.getSubmissionDate().toString() : null)
                .status(application.getStatus() != null ? application.getStatus().name().toLowerCase() : null)
                .build();
    }
}
