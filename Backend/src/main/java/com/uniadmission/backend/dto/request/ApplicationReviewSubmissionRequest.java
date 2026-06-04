package com.uniadmission.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewSubmissionRequest {
    private Long reviewerId;
    private Double reviewScore;
    private String notes;
}