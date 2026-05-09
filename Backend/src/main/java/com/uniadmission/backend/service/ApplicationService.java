package com.uniadmission.backend.service;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import java.util.List;

public interface ApplicationService {
    Application submit(ApplicationSubmitRequest request);

    List<Application> getApplicationsByCandidate(Long candidateId);

    void cancelApplication(Long applicationId);

    List<Application> getAllApplications();

    void updateApplicationStatus(Long id, ApplicationStatus status);
}