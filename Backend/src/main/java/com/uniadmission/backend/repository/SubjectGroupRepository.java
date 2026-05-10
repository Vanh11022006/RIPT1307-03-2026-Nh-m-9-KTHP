package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.SubjectGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectGroupRepository extends JpaRepository<SubjectGroup, Long> {
    Optional<SubjectGroup> findByCode(String code);
}