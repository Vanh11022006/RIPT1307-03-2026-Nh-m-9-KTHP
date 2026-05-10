package com.uniadmission.backend.service;

import com.uniadmission.backend.entity.AdmissionRound;
import java.util.List;

public interface AdmissionRoundService {
    List<AdmissionRound> getAll();

    AdmissionRound getById(Long id);

    AdmissionRound create(AdmissionRound admissionRound);

    AdmissionRound update(Long id, AdmissionRound admissionRound);

    void delete(Long id);
}