package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.service.FileService;
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
public class UploadController {

    private final FileService fileService;

    @PostMapping("/evidence")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadEvidenceFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category) {

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

        return ResponseEntity.ok(new ApiResponse<>(true, "Tải file minh chứng lên thành công", fileData));
    }
}
