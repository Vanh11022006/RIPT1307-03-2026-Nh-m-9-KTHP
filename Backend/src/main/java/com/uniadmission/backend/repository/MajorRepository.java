package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.Major;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MajorRepository extends JpaRepository<Major, Long> {

    @EntityGraph(attributePaths = {"university", "subjectGroupCodes"})
    List<Major> findAll();

    @EntityGraph(attributePaths = {"university", "subjectGroupCodes"})
    List<Major> findByUniversity_Id(Long universityId);
}
