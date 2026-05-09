package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.*;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.*;
import com.uniadmission.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationServiceImpl implements ApplicationService {

        @Autowired
        private ApplicationRepository applicationRepository;
        @Autowired
        private CandidateRepository candidateRepository;
        @Autowired
        private MajorRepository majorRepository;
        @Autowired
        private AdmissionRoundRepository admissionRoundRepository;
        @Autowired
        private SubjectGroupRepository subjectGroupRepository;

        @Override
        @Transactional
        public Application submit(ApplicationSubmitRequest request) {
                Candidate candidate = candidateRepository.findById(request.getCandidateId())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy thí sinh"));
                Major major = majorRepository.findById(request.getMajorId())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngành học"));
                AdmissionRound round = admissionRoundRepository.findById(request.getAdmissionRoundId())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt xét tuyển"));
                SubjectGroup group = subjectGroupRepository.findById(request.getSubjectGroupId())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy tổ hợp môn"));

                Application application = new Application();
                application.setCandidate(candidate);
                application.setMajor(major);
                application.setAdmissionRound(round);
                application.setSubjectGroup(group);
                application.setTotalScore(request.getTotalScore());
                application.setStatus(ApplicationStatus.PENDING);
                application.setSubmissionDate(LocalDateTime.now());

                return applicationRepository.save(application);
        }

        @Override
        public List<Application> getApplicationsByCandidate(Long candidateId) {
                return applicationRepository.findByCandidateId(candidateId);
        }
}