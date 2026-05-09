package com.uniadmission.backend.service;

import com.uniadmission.backend.dto.request.LoginRequest;
import com.uniadmission.backend.dto.request.RegisterRequest;
import com.uniadmission.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}