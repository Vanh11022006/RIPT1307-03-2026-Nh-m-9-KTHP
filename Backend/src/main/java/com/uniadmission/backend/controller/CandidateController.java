package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.dto.request.CandidateProfileRequest;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.service.CandidateService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@Tag(name = "Candidates", description = "Quản lý hồ sơ thí sinh")
public class CandidateController {

        private final CandidateService candidateService;

        @GetMapping
        @Operation(summary = "Danh sách thí sinh", description = "Lấy toàn bộ hồ sơ candidate")
        public ResponseEntity<ApiResponse<List<Candidate>>> getAllCandidates() {
                List<Candidate> candidates = candidateService.getAllCandidates();
                return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thí sinh thành công", candidates));
        }

        @GetMapping("/my-profile/{userId}")
        @Operation(summary = "Hồ sơ cá nhân", description = "Lấy hồ sơ candidate theo userId")
        public ResponseEntity<ApiResponse<Candidate>> getMyProfile(@PathVariable Long userId) {

                try {
                        Candidate profile = candidateService.getProfile(userId);
                        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy hồ sơ thành công", profile));
                } catch (RuntimeException ex) {
                        return ResponseEntity.status(404).body(new ApiResponse<>(false, ex.getMessage(), null));
                }
        }

        @PutMapping("/my-profile/{userId}")
        @Operation(summary = "Cập nhật hồ sơ cá nhân", description = "Cập nhật thông tin hồ sơ candidate")
        @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = CandidateProfileRequest.class), examples = @ExampleObject(name = "CandidateProfileExample", value = "{\"fullName\":\"Nguyen Van A\",\"email\":\"student@example.com\",\"phone\":\"0912345678\",\"address\":\"123 Le Loi, Q1, TP.HCM\",\"citizenId\":\"079201001234\",\"dateOfBirth\":\"2006-08-15\",\"gender\":\"male\",\"city\":\"TP.HCM\",\"highSchool\":\"THPT Nguyen Hue\",\"graduationYear\":2024}")))
        public ResponseEntity<ApiResponse<Candidate>> updateMyProfile(
                        @PathVariable Long userId,
                        @RequestBody CandidateProfileRequest details) {

                try {
                        Candidate updatedProfile = candidateService.updateProfile(userId, details);
                        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật hồ sơ thành công", updatedProfile));
                } catch (RuntimeException ex) {
                        return ResponseEntity.status(404).body(new ApiResponse<>(false, ex.getMessage(), null));
                }
        }
}
