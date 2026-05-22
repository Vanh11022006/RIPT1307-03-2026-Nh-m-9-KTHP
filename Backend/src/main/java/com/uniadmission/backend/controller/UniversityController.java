package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.ApiResponse;
import com.uniadmission.backend.entity.University;
import com.uniadmission.backend.repository.UniversityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/universities")
@RequiredArgsConstructor
@Tag(name = "Universities", description = "Tra cứu danh sách trường đại học")
public class UniversityController {

    private final UniversityRepository universityRepository;

    @GetMapping
    @Operation(summary = "Danh sách trường", description = "Lấy toàn bộ trường đại học")
    public ResponseEntity<ApiResponse<List<University>>> getAll() {
        List<University> universities = universityRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách trường thành công", universities));
    }
}
