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
        existingMajor.setName(majorDetails.getName());
        existingMajor.setCode(majorDetails.getCode());
        return majorRepository.save(existingMajor);
    }

    @Override
    public void deleteMajor(Long id) {
        Major existingMajor = getMajorById(id);
        majorRepository.delete(java.util.Objects.requireNonNull(existingMajor));
    }
}
