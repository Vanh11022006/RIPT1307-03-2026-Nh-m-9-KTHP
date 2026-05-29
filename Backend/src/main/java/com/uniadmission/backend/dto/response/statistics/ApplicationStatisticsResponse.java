package com.uniadmission.backend.dto.response.statistics;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatisticsResponse {
    private Long total;
    private Long pending;
    private Long approved;
    private Long rejected;
    private Long cancelled;
    private List<ApplicationStatisticsGroupResponse> byUniversity;
    private List<ApplicationStatisticsGroupResponse> byMajor;
    private List<ApplicationStatisticsGroupResponse> byAdmissionRound;
}