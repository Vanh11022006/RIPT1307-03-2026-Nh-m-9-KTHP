package com.uniadmission.backend.controller;

import java.util.stream.Collectors;
import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.dto.response.ApplicationResponse;
import com.uniadmission.backend.dto.response.statistics.ApplicationStatisticsResponse;
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
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.uniadmission.backend.dto.request.ApplicationBulkStatusRequest;

@RestController
@Slf4j
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Quản lý hồ sơ tuyển sinh")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final FileService fileService;
    private final AttachmentRepository attachmentRepository;
    private final ApplicationRepository applicationRepository;

    @PostMapping("/{id}/upload")
    @Operation(summary = "Tải file minh chứng", description = "Upload nhiều file minh chứng cho một hồ sơ")
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
    @Operation(summary = "Nộp hồ sơ", description = "Tạo hồ sơ tuyển sinh từ thông tin đã nhập")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApplicationSubmitRequest.class), examples = @ExampleObject(name = "ApplicationSubmitExample", value = "{\"candidateId\":1,\"majorId\":3,\"admissionRoundId\":1,\"subjectGroupId\":2,\"totalScore\":27.25,\"priorityGroup\":\"KV1\",\"priorityScore\":0.75,\"scores\":{\"toan\":8.5,\"van\":7.5,\"anh\":8.75}}")))
    public ResponseEntity<ApiResponse<ApplicationResponse>> submitApplication(
            @RequestBody ApplicationSubmitRequest request) {
        log.info("Received submitApplication request payload: {}", request);
        log.info("Received submitApplication request, scores={}", request.getScores());
        Application application = applicationService.submit(request);
        ApplicationResponse resp = mapToResponse(application);
        return ResponseEntity.ok(new ApiResponse<>(true, "Submit application success", resp));
    }

    @PostMapping("/draft")
    @Operation(summary = "Lưu nháp hồ sơ", description = "Tạo một hồ sơ ở trạng thái nháp")
    public ResponseEntity<ApiResponse<ApplicationResponse>> saveDraft(@RequestBody ApplicationSubmitRequest request) {
        Application application = applicationService.saveDraft(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lưu nháp thành công", mapToResponse(application)));
    }

    @GetMapping("/candidate/{candidateId}")
    @Operation(summary = "Lấy hồ sơ theo thí sinh", description = "Trả về danh sách hồ sơ của một candidate")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplicationsByCandidate(
            @PathVariable Long candidateId) {
        List<Application> apps = applicationService.getApplicationsByCandidate(candidateId);
        List<ApplicationResponse> resp = apps.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Get applications success", resp));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Hủy hồ sơ", description = "Chuyển hồ sơ sang trạng thái đã hủy")
    public ResponseEntity<ApiResponse<Void>> cancelApplication(@PathVariable("id") Long id) {
        applicationService.cancelApplication(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cancel application success", null));
    }

    @PutMapping("/{id}/draft")
    @Operation(summary = "Cập nhật nháp", description = "Cập nhật một hồ sơ đang ở trạng thái nháp")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateDraft(@PathVariable Long id,
            @RequestBody ApplicationSubmitRequest request) {
        Application updated = applicationService.updateDraft(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật nháp thành công", mapToResponse(updated)));
    }

    @PutMapping("/{id}/submit")
    @Operation(summary = "Nộp nháp", description = "Chuyển một hồ sơ nháp sang trạng thái chờ duyệt")
    public ResponseEntity<ApiResponse<ApplicationResponse>> submitDraft(@PathVariable Long id,
            @RequestBody ApplicationSubmitRequest request) {
        Application updated = applicationService.submitDraft(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Nộp hồ sơ thành công", mapToResponse(updated)));
    }

    @GetMapping
    @Operation(summary = "Danh sách hồ sơ", description = "Lấy toàn bộ hồ sơ hiện có")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getAll() {
        List<Application> apps = applicationService.getAllApplications();
        List<ApplicationResponse> resp = apps.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Get all applications success", resp));
    }

    @PutMapping("/admin-update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật trạng thái hồ sơ", description = "Admin cập nhật trạng thái và ghi chú cho hồ sơ")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "UpdateStatusExample", value = "{\"status\":\"APPROVED\",\"notes\":\"Đủ điều kiện\",\"adminId\":1}")))
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> payload) {

        ApplicationStatus status = ApplicationStatus.valueOf(payload.get("status").toString().toUpperCase());
        String notes = payload.containsKey("notes") ? payload.get("notes").toString() : null;
        Long adminId = Long.valueOf(payload.getOrDefault("adminId", 1).toString());

        applicationService.updateApplicationStatus(id, status, notes, adminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Update status success", null));
    }

    @PostMapping("/admin-bulk-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật trạng thái hàng loạt", description = "Admin cập nhật trạng thái cho nhiều hồ sơ cùng lúc")
    public ResponseEntity<ApiResponse<Void>> bulkUpdateStatus(@RequestBody ApplicationBulkStatusRequest request) {
        ApplicationStatus status = ApplicationStatus.valueOf(request.getStatus().trim().toUpperCase());
        Long adminId = request.getAdminId() != null ? request.getAdminId() : 1L;
        applicationService.bulkUpdateApplicationStatus(request.getIds(), status, request.getNotes(), adminId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Bulk update status success", null));
    }

    @GetMapping(value = "/admin-export-csv", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xuất CSV hồ sơ admin", description = "Xuất danh sách hồ sơ theo bộ lọc của admin ra CSV")
    public ResponseEntity<String> exportAdminApplicationsCsv(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long universityId,
            @RequestParam(required = false) Long majorId,
            @RequestParam(required = false) Long admissionRoundId) {
        ApplicationStatus parsedStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            parsedStatus = ApplicationStatus.valueOf(status.trim().toUpperCase());
        }

        String csv = applicationService.exportApplicationsCsv(parsedStatus, universityId, majorId, admissionRoundId);

        // Prepend UTF-8 BOM so Microsoft Excel on Windows detects UTF-8 encoding
        // correctly
        final String UTF8_BOM = "\uFEFF";
        String csvWithBom = UTF8_BOM + (csv != null ? csv : "");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=admin-applications.csv")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(csvWithBom);
    }

    @GetMapping(value = "/admin-export-xlsx", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xuất Excel hồ sơ admin", description = "Xuất danh sách hồ sơ theo bộ lọc của admin ra file Excel")
    public ResponseEntity<byte[]> exportAdminApplicationsXlsx(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long universityId,
            @RequestParam(required = false) Long majorId,
            @RequestParam(required = false) Long admissionRoundId) {
        ApplicationStatus parsedStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            parsedStatus = ApplicationStatus.valueOf(status.trim().toUpperCase());
        }

        byte[] file = applicationService.exportApplicationsXlsx(parsedStatus, universityId, majorId, admissionRoundId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=admin-applications.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PutMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật ưu tiên hồ sơ", description = "Admin cập nhật nhóm ưu tiên và điểm ưu tiên")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "UpdatePriorityExample", value = "{\"priorityGroup\":\"KV1\",\"priorityScore\":0.75,\"adminId\":1}")))
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
    @Operation(summary = "Danh sách hồ sơ cho admin", description = "Phân trang, lọc theo trạng thái, trường, ngành và đợt xét tuyển")
    public ResponseEntity<ApiResponse<Page<Application>>> getAdminApplications(
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

        Page<Application> applications = applicationService.getApplicationsForAdmin(parsedStatus, universityId, majorId,
                admissionRoundId, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hồ sơ thành công", applications));
    }

    @GetMapping("/admin-statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thống kê hồ sơ", description = "Tổng hợp số lượng hồ sơ theo trạng thái, trường, ngành và đợt xét tuyển")
    public ResponseEntity<ApiResponse<ApplicationStatisticsResponse>> getStatistics(
            @RequestParam(required = false) Long universityId,
            @RequestParam(required = false) Long majorId,
            @RequestParam(required = false) Long admissionRoundId) {
        ApplicationStatisticsResponse stats = applicationService.getApplicationStatistics(universityId, majorId,
                admissionRoundId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thống kê thành công", stats));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết hồ sơ", description = "Lấy thông tin chi tiết của một hồ sơ")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationDetail(@PathVariable Long id) {
        Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ"));

        ApplicationResponse resp = mapToResponse(application);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết hồ sơ thành công", resp));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật hồ sơ", description = "Cập nhật lại thông tin hồ sơ đã nộp")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApplicationSubmitRequest.class), examples = @ExampleObject(name = "ApplicationUpdateExample", value = "{\"candidateId\":1,\"majorId\":3,\"admissionRoundId\":1,\"subjectGroupId\":2,\"totalScore\":27.5,\"priorityGroup\":\"KV1\",\"priorityScore\":0.75,\"scores\":{\"toan\":8.75,\"van\":7.5,\"anh\":8.75}}")))
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateApplication(@PathVariable Long id,
            @RequestBody ApplicationSubmitRequest request) {
        log.info("Received updateApplication id={}, payload={}", id, request);
        Application updated = applicationService.updateApplication(id, request);
        ApplicationResponse resp = mapToResponse(updated);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật hồ sơ thành công", resp));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa hồ sơ", description = "Xóa hồ sơ theo id")
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
                String storedFilePath = att.getFilePath() != null ? att.getFilePath() : "";
                String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/uploads/")
                        .toUriString() + storedFilePath;
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("id", att.getId());
                m.put("fileName", att.getFileName());
                m.put("fileUrl", fileUrl);
                m.put("fileType", att.getFileType());
                m.put("fileSize", null);
                evidence.add(m);
            });
        } catch (Exception ex) {
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
                .reviewScoreAverage(application.getReviewScoreAverage())
                .reviewCount(application.getReviewCount())
                .reviewedBy(application.getReviewedBy())
                .reviewedAt(application.getReviewedAt() != null ? application.getReviewedAt().toString() : null)
                .evidenceFiles(evidence)
                .submittedAt(
                        application.getSubmissionDate() != null ? application.getSubmissionDate().toString() : null)
                .status(application.getStatus() != null ? application.getStatus().name().toLowerCase() : null)
                .build();
    }
}
