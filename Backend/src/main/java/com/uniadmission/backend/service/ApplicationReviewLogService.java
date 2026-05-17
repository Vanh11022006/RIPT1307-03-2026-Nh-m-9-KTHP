package com.uniadmission.backend.service;

import com.uniadmission.backend.entity.ApplicationReviewLog;
import java.util.List;

public interface ApplicationReviewLogService {
    List<ApplicationReviewLog> getLogsByApplication(Long applicationId);

    ApplicationReviewLog createLog(ApplicationReviewLog log);
}
