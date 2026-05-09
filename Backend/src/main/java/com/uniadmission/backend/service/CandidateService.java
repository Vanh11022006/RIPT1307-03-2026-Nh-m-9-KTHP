package com.uniadmission.backend.service;

import com.uniadmission.backend.entity.Candidate;

public interface CandidateService {
    Candidate getProfile(Long userId);

    Candidate updateProfile(Long userId, Candidate candidateDetails);
}