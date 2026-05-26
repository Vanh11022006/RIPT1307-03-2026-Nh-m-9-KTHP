package com.uniadmission.backend.event;

public class EmailVerificationRequestedEvent {

    private final String to;
    private final String candidateName;
    private final String verificationUrl;

    public EmailVerificationRequestedEvent(String to, String candidateName, String verificationUrl) {
        this.to = to;
        this.candidateName = candidateName;
        this.verificationUrl = verificationUrl;
    }

    public String getTo() {
        return to;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getVerificationUrl() {
        return verificationUrl;
    }
}