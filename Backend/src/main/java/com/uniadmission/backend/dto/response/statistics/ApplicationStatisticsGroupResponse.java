package com.uniadmission.backend.dto.response.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatisticsGroupResponse {
    private Long id;
    private String code;
    private String name;
    private Long total;
    private Long draft;
    private Long pending;
    private Long approved;
    private Long rejected;
    private Long cancelled;
}