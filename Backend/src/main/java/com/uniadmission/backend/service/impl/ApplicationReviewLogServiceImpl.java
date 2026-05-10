package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.entity.ApplicationReviewLog;
import com.uniadmission.backend.repository.ApplicationReviewLogRepository;
import com.uniadmission.backend.service.ApplicationReviewLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationReviewLogServiceImpl implements ApplicationReviewLogService {

    private final ApplicationReviewLogRepository repository;

    @Override
    public List<ApplicationReviewLog> getLogsByApplication(Long applicationId) {
        return repository.findByApplicationIdOrderByCreatedAtDesc(applicationId);
    }

    @Override
    public ApplicationReviewLog createLog(ApplicationReviewLog log) {
        return repository.save(log);
    }
}