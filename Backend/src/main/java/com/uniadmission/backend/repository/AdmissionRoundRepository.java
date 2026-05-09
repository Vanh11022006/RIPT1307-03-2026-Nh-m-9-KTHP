package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.AdmissionRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdmissionRoundRepository extends JpaRepository<AdmissionRound, Long> {
}