package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;

    @Override
    public Candidate getProfile(Long userId) {
        return candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ thí sinh"));
    }

    @Override
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    @Override
    public Candidate updateProfile(Long userId, Candidate details) {
        Candidate candidate = getProfile(userId);

        candidate.setPhone(details.getPhone());
        candidate.setAddress(details.getAddress());
        candidate.setBirthDate(details.getBirthDate());
        candidate.setGender(details.getGender());
        candidate.setCitizenId(details.getCitizenId());

        candidate.setHighSchoolName(details.getHighSchoolName());

        return candidateRepository.save(candidate);
    }
}
