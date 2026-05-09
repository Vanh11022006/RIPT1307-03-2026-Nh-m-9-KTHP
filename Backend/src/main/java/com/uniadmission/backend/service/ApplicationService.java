package com.uniadmission.backend.service;

import com.uniadmission.backend.dto.request.ApplicationSubmitRequest;
import com.uniadmission.backend.entity.Application;

public interface ApplicationService {
    Application submitApplication(ApplicationSubmitRequest request);
}
