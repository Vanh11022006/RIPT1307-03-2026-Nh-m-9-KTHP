package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.service.FileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${upload.max-size-bytes:10485760}") // Mặc định là 10MB
    private long maxFileSize;

    private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(Arrays.asList(
            "application/pdf", "image/png", "image/jpeg", "image/jpg"));

    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            "pdf", "png", "jpg", "jpeg"));

    @Override
    public String storeFile(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            if (file.getSize() > maxFileSize) {
                throw new RuntimeException("File is too large. Max allowed: " + (maxFileSize / (1024 * 1024)) + " MB");
            }

            String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String cleanedPath = StringUtils.cleanPath(originalFileName);
            String extension = "";
            int extIndex = cleanedPath.lastIndexOf('.');
            if (extIndex >= 0 && extIndex < cleanedPath.length() - 1) {
                extension = cleanedPath.substring(extIndex + 1).toLowerCase();
            }

            String contentType = file.getContentType();
            boolean allowedType = contentType != null && ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase());
            boolean allowedExt = extension != null && ALLOWED_EXTENSIONS.contains(extension);
            if (!allowedType && !allowedExt) {
                throw new RuntimeException("Invalid file type. Only PDF, PNG, JPG are allowed");
            }

            // Làm sạch tên tệp để tránh lỗi hệ thống hoặc lỗ hổng bảo mật
            String finalName = (cleanedPath != null && !cleanedPath.isEmpty()) ? cleanedPath : originalFileName;
            finalName = finalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = UUID.randomUUID().toString() + "_" + finalName;
            Path root = Paths.get(uploadPath);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            Path targetLocation = root.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }
}
