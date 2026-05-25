package com.uniadmission.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Thông tin đăng ký tài khoản thí sinh")
public class RegisterRequest {
    @Schema(example = "Nguyen Van A")
    private String fullName;

    @Schema(example = "student@example.com")
    private String email;

    @Schema(example = "P@ssw0rd123")
    private String password;

    @Schema(example = "0912345678")
    private String phone;
}
