package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
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
}
