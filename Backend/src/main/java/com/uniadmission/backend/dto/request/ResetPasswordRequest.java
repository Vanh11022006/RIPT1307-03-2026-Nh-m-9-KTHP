package com.uniadmission.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu đặt lại mật khẩu")
public class ResetPasswordRequest {
    @NotBlank(message = "Token không được để trống")
    @Schema(example = "4821")
    private String token;

    @NotBlank(message = "Email không được để trống")
    @Schema(example = "student@example.com")
    private String email;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Schema(example = "NewPassword123!")
    private String newPassword;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    @Schema(example = "NewPassword123!")
    private String confirmPassword;
}