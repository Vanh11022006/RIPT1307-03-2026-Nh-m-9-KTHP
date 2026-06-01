package com.uniadmission.backend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu hồ sơ tuyển sinh")
public class ApplicationResponse {
    @Schema(example = "1001")
    private Long id;
    @Schema(example = "1")
    private Long candidateId;
    @Schema(example = "Nguyễn Văn A")
    private String candidateName;
    @Schema(example = "student@example.com")
    private String candidateEmail;
    @Schema(example = "0912345678")
    private String candidatePhone;
    @Schema(example = "2006-08-15")
    private String candidateDateOfBirth;
    @Schema(example = "male")
    private String candidateGender;
    @Schema(example = "079201001234")
    private String candidateCitizenId;
    @Schema(example = "123 Lê Lợi, Quận 1, TP.HCM")
    private String candidateAddress;
    @Schema(example = "TP.HCM")
    private String candidateCity;
    @Schema(example = "THPT Nguyễn Huệ")
    private String candidateHighSchool;
    @Schema(example = "2024")
    private Integer candidateGraduationYear;
    @Schema(example = "3")
    private Long majorId;
    @Schema(example = "Công nghệ thông tin")
    private String majorName;
    @Schema(example = "1")
    private Long universityId;
    @Schema(example = "HS-2026-0001")
    private String applicationCode;
    @Schema(example = "2")
    private Long admissionRoundId;
    @Schema(example = "Đợt 1 - 2026")
    private String admissionRoundName;
    @Schema(example = "1")
    private Long subjectGroupId;
    @Schema(example = "A00")
    private String subjectGroupName;
    @Schema(example = "A00")
    private String subjectGroupCode;
    @Schema(example = "27.25")
    private Double totalScore;
    @Schema(example = "KV1")
    private String priorityGroup;
    @Schema(example = "0.75")
    private Double priorityScore;
    @Schema(description = "Điểm thành phần theo môn", example = "{\"toan\":8.5,\"van\":7.5,\"anh\":8.75}")
    private java.util.Map<String, Double> scores;
    @Schema(example = "8.75")
    private Double reviewScoreAverage;
    @Schema(example = "3")
    private Long reviewCount;
    @Schema(example = "Nguyễn Văn A, Trần Thị B")
    private String reviewedBy;
    @Schema(example = "2026-05-22T10:30:00")
    private String reviewedAt;
    @Schema(description = "Danh sách file minh chứng")
    private java.util.List<java.util.Map<String, Object>> evidenceFiles;
    @Schema(example = "2026-05-22T10:30:00")
    private String submittedAt;
    @Schema(example = "submitted")
    private String status;
}
