package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/submit")
    @PreAuthorize("hasAuthority('CANDIDATE')")
    public ResponseEntity<ApiResponse> submitApplication(@RequestBody ApplicationSubmitRequest request) {
        applicationService.submit(request);
        return ResponseEntity.ok(new ApiResponse(true, "Application submitted successfully", null));
    }

    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("hasAuthority('CANDIDATE')")
    public ResponseEntity<ApiResponse> getMyApplications(@PathVariable("candidateId") Long candidateId) {
        List<Application> apps = applicationService.getApplicationsByCandidate(candidateId);
        return ResponseEntity.ok(new ApiResponse(true, "Applications retrieved successfully", apps));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('CANDIDATE')")
    public ResponseEntity<ApiResponse> cancel(@PathVariable("id") Long id) {
        applicationService.cancelApplication(id);
        return ResponseEntity.ok(new ApiResponse(true, "Application cancelled successfully", null));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> getAll() {
        List<Application> apps = applicationService.getAllApplications();
        return ResponseEntity.ok(new ApiResponse(true, "Get all applications success", apps));
    }

    @PutMapping("/admin-update/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> updateStatus(@PathVariable("id") Long id,
            @RequestParam ApplicationStatus status) {
        applicationService.updateApplicationStatus(id, status);
        return ResponseEntity.ok(new ApiResponse(true, "Update status success", null));
    }

}