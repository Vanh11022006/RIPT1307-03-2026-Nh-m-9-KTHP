package com.uniadmission.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin nộp hồ sơ tuyển sinh")
public class ApplicationSubmitRequest {
    @Schema(example = "1")
    private Long candidateId;
    @Schema(example = "3")
    private Long majorId;
    @Schema(example = "1")
    private Long admissionRoundId;
    @Schema(example = "2")
    private Long subjectGroupId;
    @Schema(example = "27.25")
    private double totalScore;
    @Schema(example = "KV1")
    private String priorityGroup;
    @Schema(example = "0.75")
    private Double priorityScore;
    @Schema(description = "Điểm thành phần theo môn học", example = "{\"toan\":8.5,\"van\":7.5,\"anh\":8.75}")
    private java.util.Map<String, Double> scores;
}
