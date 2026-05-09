package com.uniadmission.backend.dto.request;

import lombok.Data;

@Data
public class ApplicationSubmitRequest {
    private Long candidateId;
    private Long majorId;
    private Long admissionRoundId;
    private Long subjectGroupId;
    private Double totalScore;
}