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
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UniversityController {

    private final UniversityRepository universityRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<University>>> getAll() {
        List<University> universities = universityRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách trường thành công", universities));
    }
}
