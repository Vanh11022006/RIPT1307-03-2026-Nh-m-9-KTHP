package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.request.LoginRequest;
import com.uniadmission.backend.dto.request.RegisterRequest;
import com.uniadmission.backend.dto.response.ApiResponse;
import com.uniadmission.backend.dto.response.AuthResponse;
import com.uniadmission.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthService authService;

        @PostMapping("/register")
        public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
                AuthResponse authResponse = authService.register(request);
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.<AuthResponse>builder()
                                                .success(true)
                                                .message("Đăng ký tài khoản thành công")
                                                .data(authResponse)
                                                .build());
        }

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
                AuthResponse authResponse = authService.login(request);
                return ResponseEntity.ok(
                                ApiResponse.<AuthResponse>builder()
                                                .success(true)
                                                .message("Đăng nhập thành công")
                                                .data(authResponse)
                                                .build());
        }

        @GetMapping("/me")
        public ResponseEntity<ApiResponse<String>> getCurrentUser() {
                return ResponseEntity.ok(
                                ApiResponse.<String>builder()
                                                .success(true)
                                                .message("Lấy thông tin thành công")
                                                .data("Thông tin user sẽ được lấy từ JWT Token ở bước sau")
                                                .build());
        }

}