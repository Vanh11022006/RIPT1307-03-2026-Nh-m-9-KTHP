package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByCandidateId(Long candidateId);

    Page<Application> findAll(Pageable pageable);

    Page<Application> findByStatus(ApplicationStatus status, Pageable pageable);

    long countByStatus(ApplicationStatus status);
}