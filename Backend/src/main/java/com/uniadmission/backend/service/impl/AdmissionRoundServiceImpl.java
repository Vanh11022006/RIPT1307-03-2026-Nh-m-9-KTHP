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
        if (admissionRound.getStartDate() == null || admissionRound.getEndDate() == null) {
            throw new RuntimeException("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc");
        }
        String normalizedCode = admissionRound.getCode().trim().toUpperCase();
        if (repository.findByCode(normalizedCode).isPresent()) {
            throw new RuntimeException("Mã đợt xét tuyển " + normalizedCode + " đã tồn tại!");
        }
        if (admissionRound.getEndDate().isBefore(admissionRound.getStartDate())) {
            throw new RuntimeException("Lỗi: Ngày kết thúc không được trước ngày bắt đầu!");
        }
        admissionRound.setCode(normalizedCode);
        return repository.save(admissionRound);
    }

    @Override
    public AdmissionRound update(Long id, AdmissionRound details) {
        AdmissionRound round = getById(id);

        if (details.getCode() == null || details.getCode().trim().isEmpty()) {
            throw new RuntimeException("Mã đợt xét tuyển không được để trống");
        }

        if (details.getStartDate() == null || details.getEndDate() == null) {
            throw new RuntimeException("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc");
        }

        String normalizedCode = details.getCode().trim().toUpperCase();
        repository.findByCode(normalizedCode)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new RuntimeException("Mã đợt xét tuyển " + normalizedCode + " đã tồn tại!");
                });

        if (details.getEndDate().isBefore(details.getStartDate())) {
            throw new RuntimeException("Lỗi: Ngày kết thúc không được trước ngày bắt đầu!");
        }

        round.setCode(normalizedCode);
        round.setName(details.getName());
        round.setYear(details.getYear());
        // Use string setter to allow resilient parsing of various incoming formats
        try {
            round.setStartDate(details.getStartDate().toString());
        } catch (Exception ex) {
            round.setStartDate((String) null);
        }

        try {
            round.setEndDate(details.getEndDate().toString());
        } catch (Exception ex) {
            round.setEndDate((String) null);
        }
        round.setStatus(details.getStatus());
        round.setDescription(details.getDescription());
        round.setAdmissionMethods(details.getAdmissionMethods());

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
