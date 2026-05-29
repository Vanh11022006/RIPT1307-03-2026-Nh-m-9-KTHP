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
public class ApplicationBulkStatusRequest {
    private List<Long> ids;
    private String status;
    private String notes;
    private Long adminId;
}