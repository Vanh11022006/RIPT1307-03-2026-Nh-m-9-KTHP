package com.uniadmission.backend.service;

import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.dto.request.CandidateProfileRequest;

import java.util.List;

public interface CandidateService {
    Candidate getProfile(Long userId);

    List<Candidate> getAllCandidates();

    Candidate updateProfile(Long userId, CandidateProfileRequest candidateDetails);

}
