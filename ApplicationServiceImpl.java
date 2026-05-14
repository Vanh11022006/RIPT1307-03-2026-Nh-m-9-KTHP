package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.ApplicationReviewLog;
import com.uniadmission.backend.entity.AdmissionRound;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.entity.Major;
import com.uniadmission.backend.entity.SubjectGroup;
import com.uniadmission.backend.entity.University;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.ApplicationReviewLogRepository;
import com.uniadmission.backend.repository.AdmissionRoundRepository;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.repository.MajorRepository;
import com.uniadmission.backend.repository.SubjectGroupRepository;
import com.uniadmission.backend.repository.UniversityRepository;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.EmailService;
import com.uniadmission.backend.service.NotificationLogService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final EmailService emailService;
    private final ApplicationReviewLogRepository reviewLogRepository;
    private final NotificationLogService notificationService;
    private final CandidateRepository candidateRepository;
    private final MajorRepository majorRepository;
    private final AdmissionRoundRepository admissionRoundRepository;
    private final SubjectGroupRepository subjectGroupRepository;
    private final UniversityRepository universityRepository;
    private final ObjectMapper objectMapper;

    @Override
    public Application submit(ApplicationSubmitRequest request) {
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Major major = majorRepository.findById(request.getMajorId())
                .orElseThrow(() -> new RuntimeException("Major not found"));

        Optional<AdmissionRound> admissionRound = Optional.empty();
        if (request.getAdmissionRoundId() != null) {
            admissionRound = admissionRoundRepository.findById(request.getAdmissionRoundId());
        }

        SubjectGroup subjectGroup = subjectGroupRepository.findById(request.getSubjectGroupId())
                .orElseThrow(() -> new RuntimeException("Subject group not found"));

        Optional<University> university = Optional.empty();
        if (request.getUniversityId() != null) {
            university = universityRepository.findById(request.getUniversityId());
        }

        Application application = new Application();
        application.setApplicationCode(generateApplicationCode());
        application.setCandidate(candidate);
        application.setMajor(major);
        application.setSubjectGroup(subjectGroup);
        application.setSubjectGroupCode(request.getSubjectGroupCode());
        application.setPriorityGroup(request.getPriorityGroup());
        application.setPriorityScore(request.getPriorityScore());
        application.setTotalScore(request.getTotalScore());
        application.setCandidateNote(request.getCandidateNote());
        
        // Convert scores Map to JSON string
        if (request.getScores() != null && !request.getScores().isEmpty()) {
            try {
                application.setScores(objectMapper.writeValueAsString(request.getScores()));
            } catch (Exception e) {
                application.setScores("{}");
            }
        }
        
        // Convert evidenceFiles List to JSON string
        if (request.getEvidenceFiles() != null && !request.getEvidenceFiles().isEmpty()) {
            try {
                application.setEvidenceFiles(objectMapper.writeValueAsString(request.getEvidenceFiles()));
            } catch (Exception e) {
                application.setEvidenceFiles("[]");
            }
        }

        admissionRound.ifPresent(application::setAdmissionRound);
        university.ifPresent(application::setUniversity);
        application.setStatus(ApplicationStatus.PENDING);
        application.setSubmittedAt(java.time.LocalDateTime.now());

        return applicationRepository.save(application);
    }

    private String generateApplicationCode() {
        // Format: APP-YYYYMM-XXXXXX (e.g., APP-202412-A1B2C3)
        String timestamp = java.time.LocalDateTime.now().format(
            java.time.format.DateTimeFormatter.ofPattern("yyyyMM")
        );
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "APP-" + timestamp + "-" + random;
    }

    @Override
    public List<Application> getApplicationsByCandidate(Long candidateId) {
        return applicationRepository.findByCandidateId(candidateId);
    }

    @Override
    public void cancelApplication(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(ApplicationStatus.CANCELLED);
        applicationRepository.save(application);
    }

    @Override
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    @Override
    public void updateApplicationStatus(Long id, ApplicationStatus status, String notes, Long adminId) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String oldStatus = application.getStatus() != null ? application.getStatus().name() : "PENDING";

        application.setStatus(status);
        application.setReviewedAt(java.time.LocalDateTime.now());
        application.setReviewedBy(adminId);
        application.setAdminNote(notes);
        applicationRepository.save(application);

        ApplicationReviewLog log = new ApplicationReviewLog();
        log.setApplicationId(application.getId());
        log.setAdminId(adminId);
        log.setOldStatus(oldStatus);
        log.setNewStatus(status.name());
        log.setNotes(notes);
        reviewLogRepository.save(log);

        try {
            String email = application.getCandidate().getUser().getEmail();
            String name = application.getCandidate().getUser().getFullName();

            emailService.sendApplicationStatusEmail(email, name, status.name());

            String title = "Cập nhật trạng thái hồ sơ xét tuyển";
            String message = "Hồ sơ của bạn đã chuyển sang trạng thái: " + status.name() + ". Ghi chú: "
                    + notes;
            notificationService.createNotification(application.getCandidate().getUser().getId(), title,
                    message);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email: " + e.getMessage());
        }
    }

    @Override
    public Page<Application> getApplicationsForAdmin(ApplicationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (status != null) {
            return applicationRepository.findByStatus(status, pageable);
        }
        return applicationRepository.findAll(pageable);
    }

    @Override
    public Map<String, Long> getApplicationStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("PENDING", applicationRepository.countByStatus(ApplicationStatus.PENDING));
        stats.put("APPROVED", applicationRepository.countByStatus(ApplicationStatus.APPROVED));
        stats.put("REJECTED", applicationRepository.countByStatus(ApplicationStatus.REJECTED));
        stats.put("CANCELLED", applicationRepository.countByStatus(ApplicationStatus.CANCELLED));
        stats.put("TOTAL", applicationRepository.count());
        return stats;
    }
}
