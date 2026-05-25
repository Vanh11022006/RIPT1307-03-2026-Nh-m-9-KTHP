package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.entity.Major;
import com.uniadmission.backend.repository.MajorRepository;
import com.uniadmission.backend.service.MajorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MajorServiceImpl implements MajorService {

    private final MajorRepository majorRepository;

    @Override
    public List<Major> getAllMajors() {
        return majorRepository.findAll();
    }

    @Override
    public List<Major> getMajorsByUniversityId(Long universityId) {
        return majorRepository.findByUniversity_Id(universityId);
    }

    @Override
    public Major getMajorById(Long id) {
        return majorRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Major not found"));
    }

    @Override
    public Major createMajor(Major major) {
        return majorRepository.save(java.util.Objects.requireNonNull(major));
    }

    @Override
    public Major updateMajor(Long id, Major majorDetails) {
        Major existingMajor = getMajorById(id);
        if (majorDetails.getUniversity() != null)
            existingMajor.setUniversity(majorDetails.getUniversity());
        if (majorDetails.getName() != null)
            existingMajor.setName(majorDetails.getName());
        if (majorDetails.getCode() != null)
            existingMajor.setCode(majorDetails.getCode());
        if (majorDetails.getAdmissionQuota() != null)
            existingMajor.setAdmissionQuota(majorDetails.getAdmissionQuota());
        if (majorDetails.getSubjectGroupCodes() != null)
            existingMajor.setSubjectGroupCodes(majorDetails.getSubjectGroupCodes());
        if (majorDetails.getMinScore() != null)
            existingMajor.setMinScore(majorDetails.getMinScore());
        if (majorDetails.getTuitionFeePerYear() != null)
            existingMajor.setTuitionFeePerYear(majorDetails.getTuitionFeePerYear());
        if (majorDetails.getDescription() != null)
            existingMajor.setDescription(majorDetails.getDescription());
        if (majorDetails.getBenchmarkScore() != null)
            existingMajor.setBenchmarkScore(majorDetails.getBenchmarkScore());
        if (majorDetails.getStatus() != null)
            existingMajor.setStatus(majorDetails.getStatus());
        return majorRepository.save(existingMajor);
    }

    @Override
    public void deleteMajor(Long id) {
        Major existingMajor = getMajorById(id);
        majorRepository.delete(java.util.Objects.requireNonNull(existingMajor));
    }
}
