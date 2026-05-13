package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.entity.AdmissionRound;
import com.uniadmission.backend.service.AdmissionRoundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admission-rounds")
@RequiredArgsConstructor
public class AdmissionRoundController {

    private final AdmissionRoundService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdmissionRound>>> getAll() {
        List<AdmissionRound> rounds = service.getAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đợt tuyển sinh thành công", rounds));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdmissionRound>> create(@RequestBody AdmissionRound round) {
        AdmissionRound created = service.create(round);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo đợt tuyển sinh thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdmissionRound>> update(@PathVariable Long id,
            @RequestBody AdmissionRound details) {
        AdmissionRound updated = service.update(id, details);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật đợt tuyển sinh thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa đợt tuyển sinh thành công", null));
    }
}
