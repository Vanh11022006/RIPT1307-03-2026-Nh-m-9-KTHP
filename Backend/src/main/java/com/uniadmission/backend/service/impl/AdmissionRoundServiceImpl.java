package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.entity.AdmissionRound;
import com.uniadmission.backend.repository.AdmissionRoundRepository;
import com.uniadmission.backend.service.AdmissionRoundService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdmissionRoundServiceImpl implements AdmissionRoundService {

    private final AdmissionRoundRepository repository;

    @Override
    public List<AdmissionRound> getAll() {
        return repository.findAll();
    }

    @Override
    public AdmissionRound getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt tuyển sinh ID: " + id));
    }

    @Override
    public AdmissionRound create(AdmissionRound admissionRound) {
        if (admissionRound.getEndDate().isBefore(admissionRound.getStartDate())) {
            throw new RuntimeException("Lỗi: Ngày kết thúc không được trước ngày bắt đầu!");
        }
        return repository.save(admissionRound);
    }

    @Override
    public AdmissionRound update(Long id, AdmissionRound details) {
        AdmissionRound round = getById(id);

        if (details.getEndDate().isBefore(details.getStartDate())) {
            throw new RuntimeException("Lỗi: Ngày kết thúc không được trước ngày bắt đầu!");
        }

        round.setName(details.getName());
        round.setStartDate(details.getStartDate());
        round.setEndDate(details.getEndDate());
        round.setStatus(details.getStatus());

        return repository.save(round);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy đợt tuyển sinh để xóa");
        }
        repository.deleteById(id);
    }
}