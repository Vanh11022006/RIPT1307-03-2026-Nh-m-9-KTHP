package com.uniadmission.backend.service;

import com.uniadmission.backend.entity.SubjectGroup;
import java.util.List;

public interface SubjectGroupService {
    List<SubjectGroup> getAll();

    SubjectGroup create(SubjectGroup subjectGroup);

    SubjectGroup update(Long id, SubjectGroup subjectGroup);

    void delete(Long id);
}