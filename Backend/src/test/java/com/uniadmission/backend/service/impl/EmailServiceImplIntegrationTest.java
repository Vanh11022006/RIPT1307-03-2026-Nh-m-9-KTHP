package com.uniadmission.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Properties;
import javax.mail.BodyPart;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.internet.MimeMessage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.aop.framework.Advised;
import org.springframework.aop.support.AopUtils;

@SpringBootTest
@ActiveProfiles("test")
class EmailServiceImplIntegrationTest {

    @Autowired
    private com.uniadmission.backend.service.EmailService emailService;

    private com.uniadmission.backend.service.impl.EmailServiceImpl targetEmailService;

    @MockBean
    private JavaMailSender mailSender;

    private MimeMessage lastSentMessage;

    @BeforeEach
    void setUp() {
        when(mailSender.createMimeMessage())
                .thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));
        doAnswer(invocation -> {
            lastSentMessage = invocation.getArgument(0);
            return null;
        }).when(mailSender).send(any(MimeMessage.class));
        doNothing().when(mailSender).send((SimpleMailMessage) any());
        lastSentMessage = null;
        // unwrap proxy to call implementation synchronously in tests
        if (AopUtils.isAopProxy(emailService) && emailService instanceof Advised) {
            try {
                Object target = ((Advised) emailService).getTargetSource().getTarget();
                if (target instanceof com.uniadmission.backend.service.impl.EmailServiceImpl) {
                    targetEmailService = (com.uniadmission.backend.service.impl.EmailServiceImpl) target;
                }
            } catch (Exception e) {
                // ignore and fallback to proxy
                targetEmailService = null;
            }
        }
    }

    @Test
    void sendPasswordResetEmail_rendersAbsoluteResetLink() throws Exception {
        (targetEmailService != null ? targetEmailService : emailService).sendPasswordResetEmail("student@example.com",
                "4821");
        // wait for async send to complete
        long start = System.currentTimeMillis();
        while (lastSentMessage == null && System.currentTimeMillis() - start < 2000) {
            Thread.sleep(50);
        }

        verify(mailSender).send(any(MimeMessage.class));
        MimeMessage message = lastSentMessage;
        String html = extractHtml(message);

        assertThat(html).contains("http://localhost:5173/reset-password?code=4821");
        assertThat(html).contains("Khôi phục mật khẩu");
    }

    @Test
    void sendEmailVerificationEmail_rendersVerificationLink() throws Exception {
        (targetEmailService != null ? targetEmailService : emailService).sendEmailVerificationEmail(
                "student@example.com",
                "Nguyễn Văn A",
                "http://localhost:5173/verify-email?token=abc123");
        long start = System.currentTimeMillis();
        while (lastSentMessage == null && System.currentTimeMillis() - start < 2000) {
            Thread.sleep(50);
        }

        verify(mailSender).send(any(MimeMessage.class));
        MimeMessage message = lastSentMessage;
        String html = extractHtml(message);

        assertThat(html).contains("http://localhost:5173/verify-email?token=abc123");
        assertThat(html).contains("Xác minh email tài khoản");
        assertThat(html).contains("Nguyễn Văn A");
    }

    @Test
    void sendApplicationSubmittedEmail_rendersTemplateContent() throws Exception {
        (targetEmailService != null ? targetEmailService : emailService).sendApplicationSubmittedEmail(
                "student@example.com",
                "Nguyễn Văn A",
                "APP-001",
                "Đại học Quốc gia",
                "Công nghệ thông tin");
        long start = System.currentTimeMillis();
        while (lastSentMessage == null && System.currentTimeMillis() - start < 2000) {
            Thread.sleep(50);
        }

        verify(mailSender).send(any(MimeMessage.class));
        MimeMessage message = lastSentMessage;
        String html = extractHtml(message);

        assertThat(html).contains("Nguyễn Văn A");
        assertThat(html).contains("APP-001");
        assertThat(html).contains("Đại học Quốc gia");
        assertThat(html).contains("Công nghệ thông tin");
    }

    @Test
    void sendCustomEmail_sendsProvidedSubjectAndBody() throws Exception {
        (targetEmailService != null ? targetEmailService : emailService).sendCustomEmail(
                "student@example.com",
                "[UniAdmission] Thông báo riêng",
                "Nội dung tùy chỉnh dành cho thí sinh",
                false);
        long start = System.currentTimeMillis();
        while (lastSentMessage == null && System.currentTimeMillis() - start < 2000) {
            Thread.sleep(50);
        }

        verify(mailSender).send(any(MimeMessage.class));
        MimeMessage message = lastSentMessage;
        String content = String.valueOf(message.getContent());

        assertThat(message.getSubject()).contains("Thông báo riêng");
        assertThat(content).contains("Nội dung tùy chỉnh dành cho thí sinh");
    }

    private String extractHtml(MimeMessage message) throws Exception {
        Object content = message.getContent();
        if (content instanceof Multipart) {
            Multipart multipart = (Multipart) content;
            for (int i = 0; i < multipart.getCount(); i++) {
                BodyPart part = multipart.getBodyPart(i);
                Object partContent = part.getContent();
                if (partContent instanceof String) {
                    return (String) partContent;
                }
                if (partContent instanceof Multipart) {
                    Multipart nested = (Multipart) partContent;
                    for (int j = 0; j < nested.getCount(); j++) {
                        Object nestedContent = nested.getBodyPart(j).getContent();
                        if (nestedContent instanceof String) {
                            return (String) nestedContent;
                        }
                    }
                }
            }
        }
        return String.valueOf(content);
    }
}
