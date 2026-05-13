package com.uniadmission.backend.service;

public interface EmailService {
    void sendApplicationStatusEmail(String to, String candidateName, String status);
}
