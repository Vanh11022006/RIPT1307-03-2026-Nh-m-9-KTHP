package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Major;
import com.uniadmission.backend.service.MajorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/majors")
@RequiredArgsConstructor
public class MajorController {

    private final MajorService majorService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllMajors() {
        List<Major> majors = majorService.getAllMajors();
        return ResponseEntity.ok(new ApiResponse(true, "Get all majors success", majors));
    }

    @GetMapping("/university/{universityId}")
    public ResponseEntity<ApiResponse> getMajorsByUniversity(@PathVariable Long universityId) {
        List<Major> majors = majorService.getMajorsByUniversityId(universityId);
        return ResponseEntity.ok(new ApiResponse(true, "Get majors by university success", majors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getMajorById(@PathVariable Long id) {
        Major major = majorService.getMajorById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Get major detail success", major));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createMajor(@RequestBody Major major) {
        Major newMajor = majorService.createMajor(major);
        return ResponseEntity.ok(new ApiResponse(true, "Create major success", newMajor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateMajor(@PathVariable Long id, @RequestBody Major major) {
        Major updatedMajor = majorService.updateMajor(id, major);
        return ResponseEntity.ok(new ApiResponse(true, "Update major success", updatedMajor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteMajor(@PathVariable Long id) {
        majorService.deleteMajor(id);
        return ResponseEntity.ok(new ApiResponse(true, "Delete major success", null));
    }
}