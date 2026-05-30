package com.uniadmission.backend.dto.response;

import com.uniadmission.backend.entity.ApplicationReviewLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewSummaryResponse {
    private Long applicationId;
    private List<ReviewerSummaryResponse> assignedReviewers;
    private Double averageReviewScore;
    private Long reviewCount;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private List<ApplicationReviewLog> reviewLogs;
}