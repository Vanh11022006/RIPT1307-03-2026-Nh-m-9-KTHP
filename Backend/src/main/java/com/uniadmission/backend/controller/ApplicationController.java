package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse> submitApplication(@RequestBody ApplicationSubmitRequest request) {
        applicationService.submit(request);
        return ResponseEntity.ok(new ApiResponse(true, "Nộp đơn xét tuyển thành công!", null));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<ApiResponse> getMyApplications(@PathVariable Long candidateId) {
        List<Application> apps = applicationService.getApplicationsByCandidate(candidateId);
        return ResponseEntity.ok(new ApiResponse(true, "Lấy danh sách hồ sơ thành công", apps));
    }
}