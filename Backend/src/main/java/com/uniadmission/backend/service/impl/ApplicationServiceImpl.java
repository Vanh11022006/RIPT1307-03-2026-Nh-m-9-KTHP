package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.*;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.*;
import com.uniadmission.backend.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final MajorRepository majorRepository;
    private final AdmissionRoundRepository admissionRoundRepository;
    private final SubjectGroupRepository subjectGroupRepository;

    @Override
    public Application submitApplication(ApplicationSubmitRequest request) {
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thí sinh"));
        Major major = majorRepository.findById(request.getMajorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngành học"));
        AdmissionRound round = admissionRoundRepository.findById(request.getAdmissionRoundId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt tuyển sinh"));
        SubjectGroup group = subjectGroupRepository.findById(request.getSubjectGroupId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tổ hợp môn"));

        Application application = Application.builder()
                .candidate(candidate)
                .major(major)
                .admissionRound(round)
                .subjectGroup(group)
                .totalScore(request.getTotalScore())
                .status(ApplicationStatus.PENDING)
                .submissionDate(LocalDateTime.now())
                .build();

        return applicationRepository.save(application);
    }
}