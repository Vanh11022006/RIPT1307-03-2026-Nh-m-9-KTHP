package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByUser_Id(Long userId);

    List<Candidate> findAllByUser_RoleIgnoreCase(String role);
}
