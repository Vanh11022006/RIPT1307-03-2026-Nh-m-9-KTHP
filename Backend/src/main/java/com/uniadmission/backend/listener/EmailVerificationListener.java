package com.uniadmission.backend.listener;

import com.uniadmission.backend.event.EmailVerificationRequestedEvent;
import com.uniadmission.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationListener {

    private final EmailService emailService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEmailVerificationRequested(EmailVerificationRequestedEvent event) {
        try {
            emailService.sendEmailVerificationEmail(event.getTo(), event.getCandidateName(),
                    event.getVerificationUrl());
            log.info("Đã gửi email xác minh đến {}", event.getTo());
        } catch (Exception ex) {
            log.error("Không gửi được email xác minh đến {}", event.getTo(), ex);
            log.warn("Fallback local test link for {}: {}", event.getTo(), event.getVerificationUrl());
        }
    }
}