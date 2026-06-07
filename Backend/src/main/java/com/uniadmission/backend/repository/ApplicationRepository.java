package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {

    @EntityGraph(attributePaths = {
        "candidate", "candidate.user", 
        "major", "major.university", 
        "admissionRound", "subjectGroup"
    })
    List<Application> findByCandidate_Id(Long candidateId);

    boolean existsByCandidateIdAndMajorIdAndAdmissionRoundId(Long candidateId, Long majorId, Long admissionRoundId);

    boolean existsByCandidateIdAndMajorIdAndAdmissionRoundIdAndIdNot(Long candidateId, Long majorId, Long admissionRoundId, Long id);

    Page<Application> findByStatus(ApplicationStatus status, @org.springframework.lang.NonNull Pageable pageable);

    long countByStatus(ApplicationStatus status);
}
