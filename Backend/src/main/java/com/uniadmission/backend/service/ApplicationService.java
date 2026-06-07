package com.uniadmission.backend.service;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.dto.response.statistics.ApplicationStatisticsResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface ApplicationService {

        Application submit(ApplicationSubmitRequest request);

        Application saveDraft(ApplicationSubmitRequest request);

        Application updateDraft(Long id, ApplicationSubmitRequest request);

        Application submitDraft(Long id, ApplicationSubmitRequest request);

        List<Application> getApplicationsByCandidate(Long candidateId);

        void cancelApplication(Long applicationId);

        List<Application> getAllApplications();

        Application updateApplicationStatus(Long id, ApplicationStatus status, String notes, Long adminId);

        void updateApplicationPriority(Long id, String priorityGroup, Double priorityScore, Long adminId);

        void bulkUpdateApplicationStatus(java.util.List<Long> ids, ApplicationStatus status, String notes,
                        Long adminId);

        String exportApplicationsCsv(ApplicationStatus status, Long universityId, Long majorId, Long admissionRoundId);

        java.util.List<Application> getApplicationsForExport(ApplicationStatus status, Long universityId, Long majorId,
                        Long admissionRoundId);

        byte[] exportApplicationsXlsx(ApplicationStatus status, Long universityId, Long majorId, Long admissionRoundId);

        Application updateApplication(Long id, com.uniadmission.backend.dto.request.ApplicationSubmitRequest request);

        void deleteApplication(Long id);

        Page<Application> getApplicationsForAdmin(ApplicationStatus status, Long universityId, Long majorId,
                        Long admissionRoundId, int page, int size);

        ApplicationStatisticsResponse getApplicationStatistics(Long universityId, Long majorId, Long admissionRoundId);

        Application getApplicationById(Long id);

        void uploadAttachments(Long id, java.util.List<org.springframework.web.multipart.MultipartFile> files);
}
