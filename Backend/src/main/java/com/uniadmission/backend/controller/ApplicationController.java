package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Application>> submitApplication(@RequestBody ApplicationSubmitRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<Application>builder()
                        .success(true)
                        .message("Nộp hồ sơ xét tuyển thành công")
                        .data(applicationService.submitApplication(request))
                        .build());
    }
}