package com.uniadmission.backend.dto.request;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBulkEmailRequest {
    private List<Long> applicationIds;
    private String subject;
    private String message;
    private boolean html;
    private Long adminId;
}