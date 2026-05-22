package com.uniadmission.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Thông tin đăng nhập")
public class LoginRequest {
    @Schema(example = "student@example.com")
    private String email;

    @Schema(example = "P@ssw0rd123")
    private String password;

    @Schema(example = "true")
    private Boolean remember;
}
