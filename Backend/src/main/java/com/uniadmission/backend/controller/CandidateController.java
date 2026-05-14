package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.service.CandidateService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

        private final CandidateService candidateService;

        @GetMapping
        public ResponseEntity<ApiResponse<List<Candidate>>> getAllCandidates() {
                List<Candidate> candidates = candidateService.getAllCandidates();
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thí sinh thành công", candidates));
        }

        @GetMapping("/my-profile/{userId}")
        public ResponseEntity<ApiResponse<Candidate>> getMyProfile(@PathVariable Long userId) {

                try {
                        Candidate profile = candidateService.getProfile(userId);
                        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy hồ sơ thành công", profile));
                } catch (RuntimeException ex) {
                        return ResponseEntity.status(404).body(new ApiResponse<>(false, ex.getMessage(), null));
                }
        }

        @PutMapping("/my-profile/{userId}")
        public ResponseEntity<ApiResponse<Candidate>> updateMyProfile(
                        @PathVariable Long userId,
                        @RequestBody Candidate details) {

                try {
                        Candidate updatedProfile = candidateService.updateProfile(userId, details);
                        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật hồ sơ thành công", updatedProfile));
                } catch (RuntimeException ex) {
                        return ResponseEntity.status(404).body(new ApiResponse<>(false, ex.getMessage(), null));
                }
        }
}
