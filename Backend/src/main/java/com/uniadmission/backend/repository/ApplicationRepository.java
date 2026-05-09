package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
}