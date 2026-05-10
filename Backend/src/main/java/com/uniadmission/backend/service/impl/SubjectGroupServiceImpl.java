package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.entity.SubjectGroup;
import com.uniadmission.backend.repository.SubjectGroupRepository;
import com.uniadmission.backend.service.SubjectGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectGroupServiceImpl implements SubjectGroupService {

    private final SubjectGroupRepository repository;

    @Override
    public List<SubjectGroup> getAll() {
        return repository.findAll();
    }

    @Override
    public SubjectGroup create(SubjectGroup subjectGroup) {
        if (repository.findByCode(subjectGroup.getCode()).isPresent()) {
            throw new RuntimeException("Mã tổ hợp môn " + subjectGroup.getCode() + " đã tồn tại!");
        }
        return repository.save(subjectGroup);
    }

    @Override
    public SubjectGroup update(Long id, SubjectGroup details) {
        SubjectGroup group = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tổ hợp môn ID: " + id));

        group.setName(details.getName());
        group.setSubjects(details.getSubjects());
        return repository.save(group);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy tổ hợp để xóa");
        }
        repository.deleteById(id);
    }
}