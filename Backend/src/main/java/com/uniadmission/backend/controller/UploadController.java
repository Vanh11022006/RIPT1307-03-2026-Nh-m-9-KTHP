package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Tag(name = "Uploads", description = "Tải lên file minh chứng")
public class UploadController {

    private final FileService fileService;

    @PostMapping("/evidence")
    @Operation(summary = "Upload file minh chứng", description = "Tải lên một file minh chứng và trả về đường dẫn truy cập")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadEvidenceFile(
            @Parameter(description = "File minh chứng cần upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Nhóm minh chứng, ví dụ: academic, identity, priority") @RequestParam(value = "category", required = false) String category) {

        String fileName = fileService.storeFile(file);
        String pathSegment = fileName != null ? fileName : "";
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(pathSegment)
                .toUriString();

        Map<String, Object> fileData = new HashMap<>();
        fileData.put("fileName", fileName);
        fileData.put("fileUrl", fileUrl);
        fileData.put("fileType", file.getContentType());
        fileData.put("fileSize", file.getSize());
        fileData.put("category", category);
        fileData.put("id", fileName);

        return ResponseEntity.ok(new ApiResponse<>(true, "Tải file minh chứng lên thành công", fileData));
    }
}
