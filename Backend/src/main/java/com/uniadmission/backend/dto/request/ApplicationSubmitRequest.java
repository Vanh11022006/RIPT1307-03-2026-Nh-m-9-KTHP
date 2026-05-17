package com.uniadmission.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationSubmitRequest {
    private Long candidateId;
    private Long majorId;
    private Long admissionRoundId;
    private Long subjectGroupId;
    private double totalScore;
    private String priorityGroup;
    private Double priorityScore;
    private java.util.Map<String, Double> scores;
}
