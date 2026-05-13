package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.ApplicationReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationReviewLogRepository extends JpaRepository<ApplicationReviewLog, Long> {
    List<ApplicationReviewLog> findByApplicationIdOrderByCreatedAtDesc(Long applicationId);
}
