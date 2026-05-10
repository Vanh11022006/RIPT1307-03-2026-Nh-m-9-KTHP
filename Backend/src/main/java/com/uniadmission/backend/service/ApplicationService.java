package com.uniadmission.backend.service;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface ApplicationService {

    Application submit(ApplicationSubmitRequest request);

    List<Application> getApplicationsByCandidate(Long candidateId);

    void cancelApplication(Long applicationId);

    List<Application> getAllApplications();

    void updateApplicationStatus(Long id, ApplicationStatus status, String notes, Long adminId);

    Page<Application> getApplicationsForAdmin(ApplicationStatus status, int page, int size);

    Map<String, Long> getApplicationStatistics();
}
