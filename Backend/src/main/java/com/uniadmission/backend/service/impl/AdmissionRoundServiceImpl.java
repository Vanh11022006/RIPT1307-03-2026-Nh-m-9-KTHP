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
        return repository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt tuyển sinh ID: " + id));
    }

    @Override
    public AdmissionRound create(AdmissionRound admissionRound) {
        if (admissionRound.getCode() == null || admissionRound.getCode().trim().isEmpty()) {
            throw new RuntimeException("Mã đợt xét tuyển không được để trống");
        }
        if (admissionRound.getEndDate().isBefore(admissionRound.getStartDate())) {
            throw new RuntimeException("Lỗi: Ngày kết thúc không được trước ngày bắt đầu!");
        }
        admissionRound.setCode(admissionRound.getCode().trim().toUpperCase());
        return repository.save(admissionRound);
    }

    @Override
    public AdmissionRound update(Long id, AdmissionRound details) {
        AdmissionRound round = getById(id);

        if (details.getCode() == null || details.getCode().trim().isEmpty()) {
            throw new RuntimeException("Mã đợt xét tuyển không được để trống");
        }

        if (details.getEndDate().isBefore(details.getStartDate())) {
            throw new RuntimeException("Lỗi: Ngày kết thúc không được trước ngày bắt đầu!");
        }

        round.setCode(details.getCode().trim().toUpperCase());
        round.setName(details.getName());
        round.setYear(details.getYear());
        round.setStartDate(details.getStartDate());
        round.setEndDate(details.getEndDate());
        round.setStatus(details.getStatus());
        round.setDescription(details.getDescription());

        return repository.save(round);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(java.util.Objects.requireNonNull(id))) {
            throw new RuntimeException("Không tìm thấy đợt tuyển sinh để xóa");
        }
        repository.deleteById(java.util.Objects.requireNonNull(id));
    }
}
