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

        @GetMapping("/my-profile/{userId}")
        public ResponseEntity<ApiResponse> getMyProfile(@PathVariable Long userId) {
                // Dùng đúng tên hàm getProfile của sếp
                Candidate profile = candidateService.getProfile(userId);
                return ResponseEntity.ok(new ApiResponse(true, "Lấy hồ sơ thành công", profile));
        }

        @PutMapping("/my-profile/{userId}")
        public ResponseEntity<ApiResponse> updateMyProfile(
                        @PathVariable Long userId,
                        @RequestBody Candidate details) { // Dùng luôn Candidate thay vì Request

                // Dùng đúng tên hàm updateProfile của sếp
                Candidate updatedProfile = candidateService.updateProfile(userId, details);
                return ResponseEntity.ok(new ApiResponse(true, "Cập nhật hồ sơ thành công", updatedProfile));
        }
}