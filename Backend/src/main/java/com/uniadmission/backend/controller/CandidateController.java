package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<Candidate>> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(
                ApiResponse.<Candidate>builder()
                        .success(true)
                        .message("Lấy hồ sơ thành công")
                        .data(candidateService.getProfile(userId))
                        .build());
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<Candidate>> updateProfile(
            @PathVariable Long userId,
            @RequestBody Candidate candidate) {
        return ResponseEntity.ok(
                ApiResponse.<Candidate>builder()
                        .success(true)
                        .message("Cập nhật hồ sơ thành công")
                        .data(candidateService.updateProfile(userId, candidate))
                        .build());
    }
}