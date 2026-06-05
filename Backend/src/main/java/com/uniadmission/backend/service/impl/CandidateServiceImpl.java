package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.CandidateProfileRequest;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.repository.UserRepository;
import com.uniadmission.backend.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
public class CandidateServiceImpl implements CandidateService {

    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;

    @Override
    public Candidate getProfile(Long userId) {
        Optional<Candidate> candidateOpt = candidateRepository.findByUser_Id(userId);
        if (candidateOpt.isPresent()) {
            return candidateOpt.get();
        }

        // Tự động tạo một hồ sơ Thí sinh trống cho người dùng chưa có
        // (ví dụ: người dùng được tạo trực tiếp trong DB hoặc trước khi quy trình đăng ký có thêm bước tạo thí sinh)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + userId));

        if (!"candidate".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Người dùng này không phải là thí sinh");
        }

        Candidate candidate = new Candidate();
        candidate.setUser(user);
        candidate.setPhone(user.getPhone());
        return candidateRepository.save(candidate);
    }

    @Override
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAllByUser_RoleIgnoreCase("candidate");
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
