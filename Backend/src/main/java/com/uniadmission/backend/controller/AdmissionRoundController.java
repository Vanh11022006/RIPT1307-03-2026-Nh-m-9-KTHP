package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.AdmissionRound;
import com.uniadmission.backend.service.AdmissionRoundService;
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
@RequestMapping("/api/admission-rounds")
@RequiredArgsConstructor
@Tag(name = "Admission Rounds", description = "Quản lý các đợt tuyển sinh")
public class AdmissionRoundController {

    private final AdmissionRoundService service;

    @GetMapping
    @Operation(summary = "Danh sách đợt tuyển sinh", description = "Lấy toàn bộ đợt tuyển sinh")
    public ResponseEntity<ApiResponse<List<AdmissionRound>>> getAll() {
        List<AdmissionRound> rounds = service.getAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đợt tuyển sinh thành công", rounds));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo đợt tuyển sinh", description = "Thêm đợt tuyển sinh mới")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = AdmissionRound.class), examples = @ExampleObject(name = "AdmissionRoundCreateExample", value = "{\"name\":\"Đợt 1 - 2026\",\"startDate\":\"2026-05-01\",\"endDate\":\"2026-07-01\",\"status\":\"upcoming\"}")))
    public ResponseEntity<ApiResponse<AdmissionRound>> create(@RequestBody AdmissionRound round) {
        AdmissionRound created = service.create(round);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo đợt tuyển sinh thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật đợt tuyển sinh", description = "Cập nhật thông tin đợt tuyển sinh")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = AdmissionRound.class), examples = @ExampleObject(name = "AdmissionRoundUpdateExample", value = "{\"name\":\"Đợt 1 - 2026\",\"startDate\":\"2026-05-01\",\"endDate\":\"2026-07-01\",\"status\":\"ongoing\"}")))
    public ResponseEntity<ApiResponse<AdmissionRound>> update(@PathVariable Long id,
            @RequestBody AdmissionRound details) {
        AdmissionRound updated = service.update(id, details);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật đợt tuyển sinh thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa đợt tuyển sinh", description = "Xóa đợt tuyển sinh theo id")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa đợt tuyển sinh thành công", null));
    }
}
