package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.AdmissionRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdmissionRoundRepository extends JpaRepository<AdmissionRound, Long> {
    Optional<AdmissionRound> findByCode(String code);
}
