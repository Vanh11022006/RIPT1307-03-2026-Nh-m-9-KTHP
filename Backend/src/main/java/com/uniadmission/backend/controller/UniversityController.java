package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.ApiResponse;
import com.uniadmission.backend.entity.University;
import com.uniadmission.backend.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/universities")
@RequiredArgsConstructor
public class UniversityController {

    private final UniversityRepository universityRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<University>>> getAll() {
        List<University> universities = universityRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách trường thành công", universities));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<University>> create(@RequestBody University university) {
        University saved = universityRepository.save(university);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo trường thành công", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<University>> update(@PathVariable Long id, @RequestBody University university) {
        return universityRepository.findById(id)
                .map(existing -> {
                    existing.setCode(university.getCode());
                    existing.setName(university.getName());
                    existing.setShortName(university.getShortName());
                    existing.setAddress(university.getAddress());
                    existing.setCity(university.getCity());
                    existing.setWebsite(university.getWebsite());
                    existing.setEmail(university.getEmail());
                    existing.setPhone(university.getPhone());
                    existing.setDescription(university.getDescription());
                    existing.setLogoUrl(university.getLogoUrl());
                    existing.setStatus(university.getStatus());
                    existing.setUpdatedAt(university.getUpdatedAt());
                    University saved = universityRepository.save(existing);
                    return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trường thành công", saved));
                })
                .orElseGet(
                        () -> ResponseEntity.badRequest().body(new ApiResponse<>(false, "Trường không tồn tại", null)));
    }
}
