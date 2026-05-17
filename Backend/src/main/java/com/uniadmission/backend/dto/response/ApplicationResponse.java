package com.uniadmission.backend.dto.response;

import com.uniadmission.backend.entity.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long candidateId;
    private Long majorId;
    private String majorName;
    private Long universityId;
    private String applicationCode;
    private Long admissionRoundId;
    private String admissionRoundName;
    private Long subjectGroupId;
    private String subjectGroupName;
    private String subjectGroupCode;
    private Double totalScore;
    private String priorityGroup;
    private Double priorityScore;
    private java.util.Map<String, Double> scores;
    private java.util.List<java.util.Map<String, Object>> evidenceFiles;
    private String submittedAt;
    private String status;
}
