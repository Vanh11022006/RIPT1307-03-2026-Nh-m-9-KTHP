package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.University;
import com.uniadmission.backend.repository.UniversityRepository;
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
@RequestMapping("/api/universities")
@RequiredArgsConstructor
@Tag(name = "Universities", description = "Quản lý trường đại học")
public class UniversityController {

    private final UniversityRepository universityRepository;

    @GetMapping
    @Operation(summary = "Danh sách trường", description = "Lấy toàn bộ trường đại học")
    public ResponseEntity<ApiResponse<List<University>>> getAll() {
        List<University> universities = universityRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách trường thành công", universities));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết trường", description = "Lấy thông tin trường theo id")
    public ResponseEntity<ApiResponse<University>> getById(@PathVariable Long id) {
        University university = universityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trường đại học với id: " + id));
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin trường thành công", university));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo trường", description = "Thêm trường đại học mới")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = University.class), examples = @ExampleObject(name = "UniversityCreateExample", value = "{\"code\":\"HUST\",\"name\":\"Đại học Bách khoa Hà Nội\",\"website\":\"https://hust.edu.vn\",\"status\":\"ACTIVE\"}")))
    public ResponseEntity<ApiResponse<University>> create(@RequestBody University university) {
        University saved = universityRepository.save(university);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo trường đại học thành công", saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật trường", description = "Cập nhật thông tin trường đại học")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = University.class), examples = @ExampleObject(name = "UniversityUpdateExample", value = "{\"code\":\"HUST\",\"name\":\"Đại học Bách khoa Hà Nội\",\"website\":\"https://hust.edu.vn\",\"status\":\"ACTIVE\"}")))
    public ResponseEntity<ApiResponse<University>> update(@PathVariable Long id, @RequestBody University details) {
        University university = universityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trường đại học với id: " + id));

        if (details.getCode() != null)
            university.setCode(details.getCode());
        if (details.getName() != null)
            university.setName(details.getName());
        if (details.getShortName() != null)
            university.setShortName(details.getShortName());
        if (details.getAddress() != null)
            university.setAddress(details.getAddress());
        if (details.getCity() != null)
            university.setCity(details.getCity());
        if (details.getLogoUrl() != null)
            university.setLogoUrl(details.getLogoUrl());
        if (details.getWebsite() != null)
            university.setWebsite(details.getWebsite());
        if (details.getEmail() != null)
            university.setEmail(details.getEmail());
        if (details.getPhone() != null)
            university.setPhone(details.getPhone());
        if (details.getDescription() != null)
            university.setDescription(details.getDescription());
        if (details.getStatus() != null)
            university.setStatus(details.getStatus());

        University updated = universityRepository.save(university);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trường đại học thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa trường", description = "Xóa trường đại học theo id")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        universityRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa trường đại học thành công", null));
    }
}
