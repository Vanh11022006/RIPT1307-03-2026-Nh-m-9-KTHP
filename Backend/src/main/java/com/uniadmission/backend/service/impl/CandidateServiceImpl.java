package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.CandidateProfileRequest;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;

    @Override
    public Candidate getProfile(Long userId) {
        return candidateRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ thí sinh"));
    }

    @Override
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    @Override
    public Candidate updateProfile(Long userId, CandidateProfileRequest details) {
        Candidate candidate = getProfile(userId);

        candidate.getUser().setFullName(details.getFullName());
        candidate.getUser().setEmail(details.getEmail());
        candidate.setPhone(details.getPhone());
        candidate.setAddress(details.getAddress());
        candidate.setCity(details.getCity());
        candidate.setBirthDate(parseDateOfBirth(details.getDateOfBirth()));
        candidate.setGender(details.getGender());
        candidate.setCitizenId(details.getCitizenId());

        candidate.setHighSchoolName(details.getHighSchool());
        candidate.setGraduationYear(details.getGraduationYear());

        return candidateRepository.save(candidate);
    }

    private LocalDate parseDateOfBirth(String dateOfBirth) {
        if (dateOfBirth == null || dateOfBirth.trim().isEmpty()) {
            return null;
        }

        try {
            return LocalDate.parse(dateOfBirth);
        } catch (DateTimeParseException ignored) {
            return OffsetDateTime.parse(dateOfBirth).toLocalDate();
        }
    }
}
