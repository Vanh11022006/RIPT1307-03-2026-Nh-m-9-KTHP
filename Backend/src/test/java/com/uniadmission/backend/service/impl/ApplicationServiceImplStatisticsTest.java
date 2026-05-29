package com.uniadmission.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.uniadmission.backend.dto.response.statistics.ApplicationStatisticsResponse;
import com.uniadmission.backend.entity.AdmissionRound;
import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.Major;
import com.uniadmission.backend.entity.University;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.AdmissionRoundRepository;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.ApplicationReviewLogRepository;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.repository.MajorRepository;
import com.uniadmission.backend.repository.SubjectGroupRepository;
import com.uniadmission.backend.service.EmailService;
import com.uniadmission.backend.service.NotificationLogService;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceImplStatisticsTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private ApplicationReviewLogRepository reviewLogRepository;

    @Mock
    private NotificationLogService notificationService;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private MajorRepository majorRepository;

    @Mock
    private AdmissionRoundRepository admissionRoundRepository;

    @Mock
    private SubjectGroupRepository subjectGroupRepository;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    @Test
    void getApplicationStatistics_buildsBreakdownByUniversityMajorAndAdmissionRound() {
        University universityA = new University();
        universityA.setId(1L);
        universityA.setCode("UNI01");
        universityA.setName("Đại học A");

        University universityB = new University();
        universityB.setId(2L);
        universityB.setCode("UNI02");
        universityB.setName("Đại học B");

        Major majorA = new Major();
        majorA.setId(10L);
        majorA.setCode("IT01");
        majorA.setName("Công nghệ thông tin");
        majorA.setUniversity(universityA);

        Major majorB = new Major();
        majorB.setId(20L);
        majorB.setCode("BA01");
        majorB.setName("Quản trị kinh doanh");
        majorB.setUniversity(universityB);

        AdmissionRound round1 = new AdmissionRound();
        round1.setId(100L);
        round1.setCode("R1");
        round1.setName("Đợt 1");

        AdmissionRound round2 = new AdmissionRound();
        round2.setId(200L);
        round2.setCode("R2");
        round2.setName("Đợt 2");

        Application app1 = new Application();
        app1.setStatus(ApplicationStatus.PENDING);
        app1.setMajor(majorA);
        app1.setAdmissionRound(round1);

        Application app2 = new Application();
        app2.setStatus(ApplicationStatus.APPROVED);
        app2.setMajor(majorA);
        app2.setAdmissionRound(round1);

        Application app3 = new Application();
        app3.setStatus(ApplicationStatus.REJECTED);
        app3.setMajor(majorB);
        app3.setAdmissionRound(round2);

        when(applicationRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(Arrays.asList(app1, app2, app3));

        ApplicationStatisticsResponse stats = applicationService.getApplicationStatistics(null, null, null);

        assertThat(stats.getTotal()).isEqualTo(3L);
        assertThat(stats.getPending()).isEqualTo(1L);
        assertThat(stats.getApproved()).isEqualTo(1L);
        assertThat(stats.getRejected()).isEqualTo(1L);
        assertThat(stats.getCancelled()).isEqualTo(0L);
        assertThat(stats.getByUniversity()).hasSize(2);
        assertThat(stats.getByUniversity().get(0).getName()).isEqualTo("Đại học A");
        assertThat(stats.getByUniversity().get(0).getTotal()).isEqualTo(2L);
        assertThat(stats.getByMajor()).hasSize(2);
        assertThat(stats.getByMajor().get(0).getName()).isEqualTo("Công nghệ thông tin");
        assertThat(stats.getByAdmissionRound()).hasSize(2);
        assertThat(stats.getByAdmissionRound().get(0).getName()).isEqualTo("Đợt 1");
    }
}