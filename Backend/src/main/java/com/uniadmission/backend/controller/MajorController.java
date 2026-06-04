package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.Major;
import com.uniadmission.backend.service.MajorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/majors")
@RequiredArgsConstructor
@Tag(name = "Majors", description = "Quản lý ngành đào tạo")
public class MajorController {

    private final MajorService majorService;

    @GetMapping
    @Operation(summary = "Danh sách ngành", description = "Lấy toàn bộ ngành đào tạo")
    public ResponseEntity<ApiResponse<List<Major>>> getAllMajors() {
        List<Major> majors = majorService.getAllMajors();
        return ResponseEntity.ok(new ApiResponse<>(true, "Get all majors success", majors));
    }

    @GetMapping("/university/{universityId}")
    @Operation(summary = "Ngành theo trường", description = "Lấy danh sách ngành theo universityId")
    public ResponseEntity<ApiResponse<List<Major>>> getMajorsByUniversity(@PathVariable Long universityId) {
        List<Major> majors = majorService.getMajorsByUniversityId(universityId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Get majors by university success", majors));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết ngành", description = "Lấy thông tin ngành theo id")
    public ResponseEntity<ApiResponse<Major>> getMajorById(@PathVariable Long id) {
        Major major = majorService.getMajorById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Get major detail success", major));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo ngành", description = "Thêm ngành đào tạo mới")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Major.class), examples = @ExampleObject(name = "MajorCreateExample", value = "{\"code\":\"IT01\",\"name\":\"Công nghệ thông tin\",\"benchmarkScore\":24.5,\"status\":\"ACTIVE\"}")))
    public ResponseEntity<ApiResponse<Major>> createMajor(@RequestBody Major major) {
        Major newMajor = majorService.createMajor(major);
        return ResponseEntity.ok(new ApiResponse<>(true, "Create major success", newMajor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật ngành", description = "Cập nhật thông tin ngành đào tạo")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = Major.class), examples = @ExampleObject(name = "MajorUpdateExample", value = "{\"code\":\"IT01\",\"name\":\"Công nghệ thông tin\",\"benchmarkScore\":25.0,\"status\":\"ACTIVE\"}")))
    public ResponseEntity<ApiResponse<Major>> updateMajor(@PathVariable Long id, @RequestBody Major major) {
        Major updatedMajor = majorService.updateMajor(id, major);
        return ResponseEntity.ok(new ApiResponse<>(true, "Update major success", updatedMajor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa ngành", description = "Xóa ngành đào tạo theo id")
    public ResponseEntity<ApiResponse<Void>> deleteMajor(@PathVariable Long id) {
        majorService.deleteMajor(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Delete major success", null));
    }
}
