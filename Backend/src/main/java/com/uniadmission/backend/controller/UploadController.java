package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @PostMapping("/evidence")
    public ResponseEntity<ApiResponse<String>> uploadEvidenceFile(@RequestParam("file") MultipartFile file) {

        String mockFileUrl = "https://storage.uniadmission.com/files/" + file.getOriginalFilename();

        return ResponseEntity.ok(
                ApiResponse.<String>builder()
                        .success(true)
                        .message("Tải file minh chứng lên thành công")
                        .data(mockFileUrl)
                        .build());
    }
}