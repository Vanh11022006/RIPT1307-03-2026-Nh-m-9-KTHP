package com.uniadmission.backend.service;

import com.uniadmission.backend.entity.Major;
import java.util.List;

public interface MajorService {

    List<Major> getAllMajors();

    List<Major> getMajorsByUniversityId(Long universityId);

    Major getMajorById(Long id);

    Major createMajor(Major major);

    Major updateMajor(Long id, Major majorDetails);

    void deleteMajor(Long id);
}
