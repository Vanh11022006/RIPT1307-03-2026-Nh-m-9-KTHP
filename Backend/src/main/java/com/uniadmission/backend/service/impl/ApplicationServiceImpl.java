package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.EmailService;
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
        private final EmailService emailService; // Tiêm EmailService vào đây

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
        public void updateApplicationStatus(Long id, ApplicationStatus status) {
                Application application = applicationRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                application.setStatus(status);
                applicationRepository.save(application);

                try {
                        String email = application.getCandidate().getUser().getEmail();
                        String name = application.getCandidate().getUser().getFullName();

                        emailService.sendApplicationStatusEmail(email, name, status.name());
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