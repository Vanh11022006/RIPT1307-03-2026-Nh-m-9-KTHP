package com.uniadmission.backend.service;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.Application;
import java.util.List;

public interface ApplicationService {
    Application submit(ApplicationSubmitRequest request);

    List<Application> getApplicationsByCandidate(Long candidateId);
}