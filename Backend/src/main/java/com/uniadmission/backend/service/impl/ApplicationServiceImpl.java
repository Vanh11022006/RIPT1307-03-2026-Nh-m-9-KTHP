package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.AdmissionRound;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.entity.Major;
import com.uniadmission.backend.entity.SubjectGroup;
import com.uniadmission.backend.entity.ApplicationReviewLog;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.AdmissionRoundRepository;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.ApplicationReviewLogRepository;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.repository.MajorRepository;
import com.uniadmission.backend.repository.SubjectGroupRepository;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.EmailService;
import com.uniadmission.backend.service.NotificationLogService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

        private static final org.slf4j.Logger LOGGER = org.slf4j.LoggerFactory.getLogger(ApplicationServiceImpl.class);

        private final ApplicationRepository applicationRepository;
        private final EmailService emailService;
        private final ApplicationReviewLogRepository reviewLogRepository;
        private final NotificationLogService notificationService;
        private final CandidateRepository candidateRepository;
        private final MajorRepository majorRepository;
        private final AdmissionRoundRepository admissionRoundRepository;
        private final SubjectGroupRepository subjectGroupRepository;

        @Override
        public Application submit(ApplicationSubmitRequest request) {
                Candidate candidate = candidateRepository
                                .findById(java.util.Objects.requireNonNull(request.getCandidateId()))
                                .orElseThrow(() -> new RuntimeException(
                                                "Candidate not found: " + request.getCandidateId()));

                Major major = majorRepository.findById(java.util.Objects.requireNonNull(request.getMajorId()))
                                .orElseThrow(() -> new RuntimeException("Major not found: " + request.getMajorId()));

                AdmissionRound admissionRound = request.getAdmissionRoundId() != null
                                ? admissionRoundRepository
                                                .findById(java.util.Objects
                                                                .requireNonNull(request.getAdmissionRoundId()))
                                                .orElseThrow(() -> new RuntimeException("Admission round not found: "
                                                                + request.getAdmissionRoundId()))
                                : null;

                SubjectGroup subjectGroup = subjectGroupRepository
                                .findById(java.util.Objects.requireNonNull(request.getSubjectGroupId()))
                                .orElseThrow(() -> new RuntimeException(
                                                "Subject group not found: " + request.getSubjectGroupId()));

                Application application = new Application();
                application.setCandidate(candidate);
                application.setMajor(major);
                application.setAdmissionRound(admissionRound);
                application.setSubjectGroup(subjectGroup);
                application.setTotalScore(request.getTotalScore());
                application.setPriorityGroup(request.getPriorityGroup());
                application.setPriorityScore(request.getPriorityScore());
                try {
                        LOGGER.info("Persisting scores for application candidateId={}: {}", request.getCandidateId(),
                                        request.getScores());
                        if (request.getScores() != null) {
                                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                                String json = mapper.writeValueAsString(request.getScores());
                                application.setScores(json);
                        }
                } catch (Exception e) {
                        LOGGER.warn("Failed to serialize scores", e);
                }
                application.setSubmissionDate(java.time.LocalDateTime.now());
                application.setStatus(ApplicationStatus.PENDING);

                Application saved = applicationRepository.save(application);
                if (saved.getApplicationCode() == null || saved.getApplicationCode().isEmpty()) {
                        String code = "HS" + java.time.LocalDate.now().getYear()
                                        + String.format("%04d", Math.abs(saved.getId().intValue()) % 10000);
                        saved.setApplicationCode(code);
                        saved = applicationRepository.save(saved);
                }

                String applicationCode = saved.getApplicationCode() != null ? saved.getApplicationCode()
                                : "Chưa cập nhật";

                try {
                        String candidateName = candidate.getUser() != null ? candidate.getUser().getFullName()
                                        : "thí sinh";
                        String email = candidate.getUser() != null ? candidate.getUser().getEmail() : null;
                        String universityName = major.getUniversity() != null ? major.getUniversity().getName() : "";
                        String majorName = major.getName() != null ? major.getName() : "";

                        if (email != null && !email.trim().isEmpty()) {
                                emailService.sendApplicationSubmittedEmail(
                                                email,
                                                candidateName,
                                                applicationCode,
                                                universityName,
                                                majorName);
                        }
                        // create in-app notification for candidate
                        try {
                                if (candidate.getUser() != null && candidate.getUser().getId() != null) {
                                        String title = "Xác nhận: hồ sơ đã được tiếp nhận";
                                        String message = "Hồ sơ của bạn (Mã: " + applicationCode
                                                        + ") đã được tiếp nhận. Trường: "
                                                        + universityName + ", Ngành: " + majorName
                                                        + ". Phòng Tuyển Sinh sẽ kiểm tra hồ sơ trong vòng 3-5 ngày làm việc.";
                                        notificationService.createNotification(candidate.getUser().getId(), title,
                                                        message);
                                }
                        } catch (Exception e) {
                                LOGGER.warn("Failed to create in-app notification for application id={}: {}",
                                                saved.getId(), e.getMessage());
                        }
                } catch (Exception e) {
                        LOGGER.warn("Failed to send application submitted email for application id={}: {}",
                                        saved.getId(), e.getMessage());
                }

                return saved;
        }

        @Override
        public List<Application> getApplicationsByCandidate(Long candidateId) {
                return applicationRepository.findByCandidate_Id(candidateId);
        }

        @Override
        public void cancelApplication(Long applicationId) {
                Application application = applicationRepository
                                .findById(java.util.Objects.requireNonNull(applicationId))
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
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                String oldStatus = application.getStatus() != null ? application.getStatus().name() : "PENDING";

                application.setStatus(status);
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
        public void updateApplicationPriority(Long id, String priorityGroup, Double priorityScore, Long adminId) {
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                application.setPriorityGroup(priorityGroup);
                application.setPriorityScore(priorityScore);
                applicationRepository.save(application);

                ApplicationReviewLog log = new ApplicationReviewLog();
                log.setApplicationId(application.getId());
                log.setAdminId(adminId != null ? adminId : 1L);
                log.setOldStatus(application.getStatus() != null ? application.getStatus().name() : "");
                log.setNewStatus(application.getStatus() != null ? application.getStatus().name() : "");
                log.setNotes("Cập nhật điểm ưu tiên: group=" + priorityGroup + ", score=" + priorityScore);
                reviewLogRepository.save(log);
        }

        @Override
        public Application updateApplication(Long id,
                        com.uniadmission.backend.dto.request.ApplicationSubmitRequest request) {
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                if (request.getMajorId() != null) {
                        Major major = majorRepository.findById(java.util.Objects.requireNonNull(request.getMajorId()))
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Major not found: " + request.getMajorId()));
                        application.setMajor(major);
                }

                if (request.getAdmissionRoundId() != null) {
                        AdmissionRound admissionRound = admissionRoundRepository
                                        .findById(java.util.Objects.requireNonNull(request.getAdmissionRoundId()))
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Admission round not found: " + request.getAdmissionRoundId()));
                        application.setAdmissionRound(admissionRound);
                }

                if (request.getSubjectGroupId() != null) {
                        SubjectGroup subjectGroup = subjectGroupRepository
                                        .findById(java.util.Objects.requireNonNull(request.getSubjectGroupId()))
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Subject group not found: " + request.getSubjectGroupId()));
                        application.setSubjectGroup(subjectGroup);
                }

                application.setTotalScore(request.getTotalScore());
                application.setPriorityGroup(request.getPriorityGroup());
                application.setPriorityScore(request.getPriorityScore());
                try {
                        LOGGER.info("Updating scores for application id={}: {}", id, request.getScores());
                        if (request.getScores() != null) {
                                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                                String json = mapper.writeValueAsString(request.getScores());
                                application.setScores(json);
                        }
                } catch (Exception e) {
                        LOGGER.warn("Failed to serialize scores on update", e);
                }
                applicationRepository.save(application);
                return application;
        }

        @Override
        public void deleteApplication(Long id) {
                Application application = applicationRepository.findById(java.util.Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Application not found"));
                applicationRepository.delete(java.util.Objects.requireNonNull(application));
        }

        @Override
        public Page<Application> getApplicationsForAdmin(ApplicationStatus status, Long universityId, Long majorId,
                        Long admissionRoundId, int page, int size) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
                Specification<Application> specification = Specification.where(null);

                if (status != null) {
                        specification = specification.and((root, query, cb) -> cb.equal(root.get("status"), status));
                }

                if (universityId != null) {
                        specification = specification.and((root, query, cb) -> cb
                                        .equal(root.join("major").join("university").get("id"), universityId));
                }

                if (majorId != null) {
                        specification = specification
                                        .and((root, query, cb) -> cb.equal(root.get("major").get("id"), majorId));
                }

                if (admissionRoundId != null) {
                        specification = specification.and((root, query, cb) -> cb
                                        .equal(root.get("admissionRound").get("id"), admissionRoundId));
                }

                return applicationRepository.findAll(specification, pageable);
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
