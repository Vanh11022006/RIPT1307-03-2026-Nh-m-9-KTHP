package com.uniadmission.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Thông tin hồ sơ cá nhân của thí sinh")
public class CandidateProfileRequest {
    @Schema(example = "Nguyen Van A")
    private String fullName;
    @Schema(example = "student@example.com")
    private String email;
    @Schema(example = "0912345678")
    private String phone;
    @Schema(example = "123 Le Loi, Q1, TP.HCM")
    private String address;
    @Schema(example = "079201001234")
    private String citizenId;
    @Schema(example = "2006-08-15")
    private String dateOfBirth;
    @Schema(example = "male")
    private String gender;
    @Schema(example = "TP.HCM")
    private String city;
    @Schema(example = "THPT Nguyen Hue")
    private String highSchool;
    @Schema(example = "2024")
    private Integer graduationYear;
}
