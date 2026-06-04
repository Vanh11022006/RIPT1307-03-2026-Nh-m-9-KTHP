package com.uniadmission.backend.service;

public interface EmailService {
    void sendApplicationSubmittedEmail(String to, String candidateName, String applicationCode, String universityName,
            String majorName);

    void sendApplicationStatusEmail(String to, String candidateName, String status);

    void sendCustomEmail(String to, String subject, String message, boolean html);

    void sendPasswordResetEmail(String to, String resetCode);

    void sendEmailVerificationEmail(String to, String candidateName, String verificationUrl);
}
