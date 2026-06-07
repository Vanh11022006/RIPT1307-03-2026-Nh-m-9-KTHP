package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.ApplicationReviewSubmissionRequest;
import com.uniadmission.backend.dto.response.ApplicationReviewSummaryResponse;
import com.uniadmission.backend.dto.response.ReviewerSummaryResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.ApplicationReviewLog;
import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.entity.enums.ApplicationReviewActionType;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.ApplicationReviewLogRepository;
import com.uniadmission.backend.repository.UserRepository;
import com.uniadmission.backend.service.ApplicationReviewLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationReviewLogServiceImpl implements ApplicationReviewLogService {

    private static final int DEFAULT_REVIEWER_COUNT = 3;

    private final ApplicationReviewLogRepository repository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @Override
    public List<ApplicationReviewLog> getLogsByApplication(Long applicationId) {
        return repository.findByApplicationIdOrderByCreatedAtDesc(applicationId);
    }

    @Override
    public ApplicationReviewLog createLog(ApplicationReviewLog log) {
        return repository.save(Objects.requireNonNull(log));
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationReviewSummaryResponse getReviewSummary(Long applicationId, int reviewerCount) {
        Application application = getApplication(applicationId);
        List<User> assignedReviewers = resolveAssignedReviewers(applicationId, reviewerCount);
        return buildSummary(application, assignedReviewers);
    }

    @Override
    @Transactional
    public ApplicationReviewSummaryResponse submitReviewScore(Long applicationId,
            ApplicationReviewSubmissionRequest request,
            int reviewerCount) {
        if (request == null || request.getReviewScore() == null) {
            throw new RuntimeException("Review score is required");
        }

        Application application = getApplication(applicationId);
        List<User> assignedReviewers = resolveAssignedReviewers(applicationId, reviewerCount);
        ensureAssignmentLog(application, assignedReviewers);
        Long reviewerId = resolveReviewerId(applicationId, assignedReviewers, request);
        User reviewer = getReviewer(reviewerId);

        ensureReviewerHasNotReviewedYet(applicationId, reviewer.getId());

        if (assignedReviewers.stream().noneMatch(user -> user.getId().equals(reviewer.getId()))) {
            throw new RuntimeException("Tài khoản đánh giá này không được phân công cho hồ sơ "
                    + applicationId + ".");
        }

        ApplicationReviewLog log = new ApplicationReviewLog();
        log.setApplicationId(applicationId);
        log.setAdminId(reviewer.getId());
        log.setActionType(ApplicationReviewActionType.REVIEW_SCORE);
        log.setOldStatus(application.getStatus() != null ? application.getStatus().name() : null);
        log.setNewStatus(application.getStatus() != null ? application.getStatus().name() : "PENDING");
        log.setReviewScore(request.getReviewScore());
        log.setReviewerName(reviewer.getFullName());
        log.setNotes(request.getNotes());
        repository.save(log);

        List<ApplicationReviewLog> reviewLogs = repository
                .findByApplicationIdAndActionTypeOrderByCreatedAtDesc(applicationId,
                        ApplicationReviewActionType.REVIEW_SCORE);
        updateApplicationReviewSnapshot(application, reviewLogs);
        return buildSummary(application, assignedReviewers);
    }

    private Application getApplication(Long applicationId) {
        return applicationRepository.findById(Objects.requireNonNull(applicationId))
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
    }

    private User getReviewer(Long reviewerId) {
        return userRepository.findById(Objects.requireNonNull(reviewerId))
                .orElseThrow(() -> new RuntimeException("Reviewer not found: " + reviewerId));
    }

    private void ensureReviewerHasNotReviewedYet(Long applicationId, Long reviewerId) {
        boolean alreadyReviewed = repository
                .findByApplicationIdAndActionTypeOrderByCreatedAtDesc(applicationId,
                        ApplicationReviewActionType.REVIEW_SCORE)
                .stream()
                .anyMatch(log -> reviewerId.equals(log.getAdminId()));

        if (alreadyReviewed) {
            throw new RuntimeException("Tài khoản đánh giá này đã gửi nhận xét cho hồ sơ "
                    + applicationId + " trước đó.");
        }
    }

    private Long resolveReviewerId(Long applicationId, List<User> assignedReviewers,
            ApplicationReviewSubmissionRequest request) {
        if (request != null && request.getReviewerId() != null) {
            return request.getReviewerId();
        }

        Set<Long> alreadyReviewed = repository
                .findByApplicationIdAndActionTypeOrderByCreatedAtDesc(applicationId,
                        ApplicationReviewActionType.REVIEW_SCORE)
                .stream()
                .map(ApplicationReviewLog::getAdminId)
                .collect(Collectors.toSet());

        for (User user : assignedReviewers) {
            if (!alreadyReviewed.contains(user.getId())) {
                return user.getId();
            }
        }

        throw new RuntimeException("Tất cả reviewer được phân công cho hồ sơ " + applicationId
                + " đã hoàn tất đánh giá.");
    }

    private List<User> resolveAssignedReviewers(Long applicationId, int reviewerCount) {
        List<User> reviewers = userRepository.findAllByRoleIgnoreCaseAndStatusIgnoreCase("admin", "active");
        reviewers = reviewers.stream()
                .filter(user -> user.getId() != null)
                .sorted(Comparator.comparing(User::getId))
                .collect(Collectors.toList());

        if (reviewers.isEmpty()) {
            throw new RuntimeException("No active reviewers available");
        }

        int desiredCount = reviewerCount > 0 ? reviewerCount : DEFAULT_REVIEWER_COUNT;
        int selectedCount = Math.min(desiredCount, reviewers.size());
        int startIndex = Math.floorMod(Long.hashCode(Objects.requireNonNull(applicationId)), reviewers.size());

        List<User> assignedReviewers = new ArrayList<>();
        for (int i = 0; i < selectedCount; i++) {
            assignedReviewers.add(reviewers.get((startIndex + i) % reviewers.size()));
        }
        return assignedReviewers;
    }

    private ApplicationReviewSummaryResponse buildSummary(Application application, List<User> assignedReviewers) {
        Double averageScore = application.getReviewScoreAverage();
        Long reviewCount = application.getReviewCount();

        List<ReviewerSummaryResponse> reviewers = assignedReviewers.stream()
                .map(user -> ReviewerSummaryResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .build())
                .collect(Collectors.toList());

        List<ApplicationReviewLog> reviewLogs = repository
                .findByApplicationIdAndActionTypeOrderByCreatedAtDesc(application.getId(),
                        ApplicationReviewActionType.REVIEW_SCORE);

        return ApplicationReviewSummaryResponse.builder()
                .applicationId(application.getId())
                .assignedReviewers(reviewers)
                .averageReviewScore(averageScore)
                .reviewCount(reviewCount)
                .reviewedBy(application.getReviewedBy())
                .reviewedAt(application.getReviewedAt())
                .reviewLogs(reviewLogs)
                .build();
    }

    private void ensureAssignmentLog(Application application, List<User> assignedReviewers) {
        List<ApplicationReviewLog> assignmentLogs = repository.findByApplicationIdAndActionTypeOrderByCreatedAtDesc(
                application.getId(), ApplicationReviewActionType.REVIEW_ASSIGNMENT);
        if (!assignmentLogs.isEmpty()) {
            return;
        }

        ApplicationReviewLog assignmentLog = new ApplicationReviewLog();
        assignmentLog.setApplicationId(application.getId());
        assignmentLog.setAdminId(assignedReviewers.get(0).getId());
        assignmentLog.setActionType(ApplicationReviewActionType.REVIEW_ASSIGNMENT);
        assignmentLog.setOldStatus(application.getStatus() != null ? application.getStatus().name() : null);
        assignmentLog.setNewStatus(application.getStatus() != null ? application.getStatus().name() : "PENDING");
        assignmentLog.setAssignedReviewerName(assignedReviewers.stream()
                .map(user -> user.getFullName() + "(#" + user.getId() + ")")
                .collect(Collectors.joining(", ")));
        assignmentLog.setReviewerName("SYSTEM");
        assignmentLog.setNotes("Auto-assigned reviewers for multi-review flow");
        repository.save(assignmentLog);
    }

    private void updateApplicationReviewSnapshot(Application application, List<ApplicationReviewLog> reviewLogs) {
        double averageScore = reviewLogs.stream()
                .map(ApplicationReviewLog::getReviewScore)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0D);

        long reviewCount = reviewLogs.stream()
                .map(ApplicationReviewLog::getReviewScore)
                .filter(Objects::nonNull)
                .count();

        List<String> reviewerNames = reviewLogs.stream()
                .map(ApplicationReviewLog::getReviewerName)
                .filter(name -> name != null && !name.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());

        application.setReviewScoreAverage(averageScore);
        application.setReviewCount(reviewCount);
        application.setReviewedBy(String.join(", ", reviewerNames));
        application.setReviewedAt(reviewLogs.isEmpty() ? null : reviewLogs.get(0).getCreatedAt());
        applicationRepository.save(application);
    }
}