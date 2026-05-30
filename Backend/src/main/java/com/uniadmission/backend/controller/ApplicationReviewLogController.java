package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.request.ApplicationReviewSubmissionRequest;
import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.dto.response.ApplicationReviewSummaryResponse;
import com.uniadmission.backend.entity.ApplicationReviewLog;
import com.uniadmission.backend.service.ApplicationReviewLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationReviewLogController {

    private final ApplicationReviewLogService logService;

    @GetMapping("/{applicationId}/logs")
    public ResponseEntity<ApiResponse<List<ApplicationReviewLog>>> getApplicationLogs(
            @PathVariable Long applicationId) {
        List<ApplicationReviewLog> logs = logService.getLogsByApplication(applicationId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", logs));
    }

    @GetMapping("/{applicationId}/review-summary")
    public ResponseEntity<ApiResponse<ApplicationReviewSummaryResponse>> getReviewSummary(
            @PathVariable Long applicationId,
            @RequestParam(defaultValue = "3") int reviewerCount) {
        ApplicationReviewSummaryResponse summary = logService.getReviewSummary(applicationId, reviewerCount);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", summary));
    }

    @PostMapping("/{applicationId}/review-scores")
    public ResponseEntity<ApiResponse<ApplicationReviewSummaryResponse>> submitReviewScore(
            @PathVariable Long applicationId,
            @RequestBody ApplicationReviewSubmissionRequest request,
            @RequestParam(defaultValue = "3") int reviewerCount) {
        ApplicationReviewSummaryResponse summary = logService.submitReviewScore(applicationId, request,
                reviewerCount);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", summary));
    }
}
