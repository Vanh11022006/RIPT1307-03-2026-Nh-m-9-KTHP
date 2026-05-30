package com.uniadmission.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.uniadmission.backend.dto.request.ApplicationReviewSubmissionRequest;
import com.uniadmission.backend.dto.response.ApplicationReviewSummaryResponse;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.ApplicationReviewLog;
import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.entity.enums.ApplicationReviewActionType;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.ApplicationReviewLogRepository;
import com.uniadmission.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ApplicationReviewLogServiceImplTest {

    @Mock
    private ApplicationReviewLogRepository reviewLogRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ApplicationReviewLogServiceImpl reviewService;

    @Test
    void submitReviewScore_autoAssignsReviewerAndAveragesMultipleScores() {
        Application application = new Application();
        application.setId(10L);
        application.setStatus(ApplicationStatus.PENDING);

        User reviewer1 = reviewer(1L, "Reviewer One");
        User reviewer2 = reviewer(2L, "Reviewer Two");
        User reviewer3 = reviewer(3L, "Reviewer Three");

        List<ApplicationReviewLog> storedLogs = new ArrayList<>();
        List<ApplicationReviewLog> reviewScoreLogs = new ArrayList<>();
        List<ApplicationReviewLog> assignmentLogs = new ArrayList<>();

        when(applicationRepository.findById(10L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findAllByRoleIgnoreCaseAndStatusIgnoreCase("admin", "active"))
                .thenReturn(Arrays.asList(reviewer1, reviewer2, reviewer3));
                when(userRepository.findById(anyLong())).thenAnswer(invocation -> {
                        Long id = invocation.getArgument(0);
                        if (Long.valueOf(2L).equals(id)) {
                                return Optional.of(reviewer2);
                        }
                        if (Long.valueOf(3L).equals(id)) {
                                return Optional.of(reviewer3);
                        }
                        if (Long.valueOf(1L).equals(id)) {
                                return Optional.of(reviewer1);
                        }
                        return Optional.empty();
                });
                when(reviewLogRepository.findByApplicationIdAndActionTypeOrderByCreatedAtDesc(eq(10L), any()))
                                .thenAnswer(invocation -> {
                                        ApplicationReviewActionType actionType = invocation.getArgument(1);
                                        if (ApplicationReviewActionType.REVIEW_SCORE.equals(actionType)) {
                                                return new ArrayList<>(reviewScoreLogs);
                                        }
                                        if (ApplicationReviewActionType.REVIEW_ASSIGNMENT.equals(actionType)) {
                                                return new ArrayList<>(assignmentLogs);
                                        }
                                        return new ArrayList<>();
                                });
        when(reviewLogRepository.save(any(ApplicationReviewLog.class))).thenAnswer(invocation -> {
            ApplicationReviewLog log = invocation.getArgument(0);
            log.setId((long) storedLogs.size() + 1);
            log.setCreatedAt(LocalDateTime.of(2026, 5, 30, 10, 0).plusMinutes(storedLogs.size()));
            storedLogs.add(0, log);
                        if (ApplicationReviewActionType.REVIEW_SCORE.equals(log.getActionType())) {
                                reviewScoreLogs.add(0, log);
                        }
                        if (ApplicationReviewActionType.REVIEW_ASSIGNMENT.equals(log.getActionType())) {
                                assignmentLogs.add(0, log);
                        }
            return log;
        });

        ApplicationReviewSummaryResponse firstSummary = reviewService.submitReviewScore(10L,
                new ApplicationReviewSubmissionRequest(null, 8.0, "First review"), 3);

        assertThat(firstSummary.getAssignedReviewers()).extracting("id")
                .containsExactly(2L, 3L, 1L);
        assertThat(firstSummary.getAverageReviewScore()).isEqualTo(8.0);
        assertThat(firstSummary.getReviewCount()).isEqualTo(1L);
        assertThat(application.getReviewScoreAverage()).isEqualTo(8.0);
        assertThat(application.getReviewCount()).isEqualTo(1L);
        assertThat(application.getReviewedBy()).isEqualTo("Reviewer Two");

        ApplicationReviewSummaryResponse secondSummary = reviewService.submitReviewScore(10L,
                new ApplicationReviewSubmissionRequest(3L, 6.0, "Second review"), 3);

        assertThat(secondSummary.getAverageReviewScore()).isEqualTo(7.0);
        assertThat(secondSummary.getReviewCount()).isEqualTo(2L);
        assertThat(secondSummary.getReviewLogs()).extracting("reviewScore")
                .contains(6.0, 8.0);
        assertThat(application.getReviewScoreAverage()).isEqualTo(7.0);
        assertThat(application.getReviewCount()).isEqualTo(2L);
        assertThat(application.getReviewedBy()).contains("Reviewer Two");
        assertThat(application.getReviewedBy()).contains("Reviewer Three");
        assertThat(storedLogs).hasSize(3);
        assertThat(storedLogs.stream().anyMatch(log -> ApplicationReviewActionType.REVIEW_ASSIGNMENT.equals(log.getActionType())))
                .isTrue();
        assertThat(storedLogs.get(0).getActionType()).isEqualTo(ApplicationReviewActionType.REVIEW_SCORE);
        assertThat(storedLogs.get(0).getReviewScore()).isEqualTo(6.0);
    }

    private User reviewer(Long id, String fullName) {
        User user = new User();
        user.setId(id);
        user.setFullName(fullName);
        user.setEmail(fullName.toLowerCase().replace(' ', '.') + "@example.com");
        user.setRole("admin");
        user.setStatus("active");
        return user;
    }
}