package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.ApplicationReviewLog;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.ApplicationReviewLogRepository;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.EmailService;
import com.uniadmission.backend.service.NotificationLogService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

        private final ApplicationRepository applicationRepository;
        private final EmailService emailService;
        private final ApplicationReviewLogRepository reviewLogRepository;
        private final NotificationLogService notificationService;

        @Override
        public Application submit(ApplicationSubmitRequest request) {
                Application application = new Application();
                application.setStatus(ApplicationStatus.PENDING);
                return applicationRepository.save(application);
        }

        @Override
        public List<Application> getApplicationsByCandidate(Long candidateId) {
                return applicationRepository.findByCandidateId(candidateId);
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
