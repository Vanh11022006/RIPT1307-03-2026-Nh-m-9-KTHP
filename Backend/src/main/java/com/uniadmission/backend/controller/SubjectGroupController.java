package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.SubjectGroup;
import com.uniadmission.backend.service.SubjectGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subject-groups")
@RequiredArgsConstructor
public class SubjectGroupController {

    private final SubjectGroupService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectGroup>>> getAll() {
        List<SubjectGroup> groups = service.getAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách tổ hợp môn thành công", groups));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubjectGroup>> create(@RequestBody SubjectGroup subjectGroup) {
        SubjectGroup created = service.create(subjectGroup);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo tổ hợp môn thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SubjectGroup>> update(@PathVariable Long id, @RequestBody SubjectGroup details) {
        SubjectGroup updated = service.update(id, details);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật tổ hợp môn thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa tổ hợp môn thành công", null));
    }
}
