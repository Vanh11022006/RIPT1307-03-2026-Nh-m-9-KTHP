package com.uniadmission.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    String storeFile(MultipartFile file);
}