package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.SubjectGroup;
import com.uniadmission.backend.service.SubjectGroupService;
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
@RequestMapping("/api/subject-groups")
@RequiredArgsConstructor
@Tag(name = "Subject Groups", description = "Quản lý tổ hợp môn xét tuyển")
public class SubjectGroupController {

    private final SubjectGroupService service;

    @GetMapping
    @Operation(summary = "Danh sách tổ hợp môn", description = "Lấy toàn bộ tổ hợp môn")
    public ResponseEntity<ApiResponse<List<SubjectGroup>>> getAll() {
        List<SubjectGroup> groups = service.getAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách tổ hợp môn thành công", groups));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo tổ hợp môn", description = "Thêm tổ hợp môn mới")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectGroup.class), examples = @ExampleObject(name = "SubjectGroupCreateExample", value = "{\"code\":\"A00\",\"name\":\"Toán - Lý - Hóa\",\"subjects\":\"Math,Physics,Chemistry\"}")))
    public ResponseEntity<ApiResponse<SubjectGroup>> create(@RequestBody SubjectGroup subjectGroup) {
        SubjectGroup created = service.create(subjectGroup);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo tổ hợp môn thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật tổ hợp môn", description = "Cập nhật thông tin tổ hợp môn")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectGroup.class), examples = @ExampleObject(name = "SubjectGroupUpdateExample", value = "{\"code\":\"A00\",\"name\":\"Toán - Lý - Hóa\",\"subjects\":\"Math,Physics,Chemistry\"}")))
    public ResponseEntity<ApiResponse<SubjectGroup>> update(@PathVariable Long id, @RequestBody SubjectGroup details) {
        SubjectGroup updated = service.update(id, details);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật tổ hợp môn thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa tổ hợp môn", description = "Xóa tổ hợp môn theo id")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa tổ hợp môn thành công", null));
    }
}
