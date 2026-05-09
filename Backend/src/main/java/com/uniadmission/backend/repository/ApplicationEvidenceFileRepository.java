package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.ApplicationEvidenceFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationEvidenceFileRepository extends JpaRepository<ApplicationEvidenceFile, Long> {
    List<ApplicationEvidenceFile> findByApplicationId(Long applicationId);
}