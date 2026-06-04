package com.uniadmission.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.uniadmission.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Kết quả đăng nhập")
public class LoginResponse {
    @Schema(example = "eyJhbGciOiJIUzI1NiJ9...", description = "JWT access token")
    private String token;
    @Schema(example = "eyJhbGciOiJIUzI1NiJ9...", description = "JWT refresh token")
    private String refreshToken;
    private User user;
}
