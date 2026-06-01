package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import java.io.UnsupportedEncodingException;
import javax.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    @Async
    public void sendApplicationSubmittedEmail(String to, String candidateName, String applicationCode,
            String universityName, String majorName) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            try {
                helper.setFrom(fromAddress, "UniAdmission");
            } catch (UnsupportedEncodingException uee) {
                helper.setFrom(fromAddress);
            }
            helper.setTo(to);
            helper.setSubject("[UniAdmission] Xác nhận đã nộp hồ sơ xét tuyển");

            String submittedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            Map<String, Object> variables = new HashMap<>();
            variables.put("candidateName", candidateName);
            variables.put("universityName", universityName);
            variables.put("majorName", majorName);
            variables.put("applicationCode", applicationCode);
            variables.put("submittedAt", submittedAt);
            String html = renderTemplate("email/application-submitted", variables);

            helper.setText(html, true);
            sendMimeMessageWithRetry(mimeMessage, "application submitted email");
        } catch (MessagingException ex) {
            log.warn("Không gửi được email HTML, thử gửi text fallback: {}", ex.getMessage());
            // fallback to plain text
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(to);
                message.setSubject("Xác nhận đã nộp hồ sơ xét tuyển");
                String submittedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                String content = "Chào " + candidateName + ",\n\n"
                        + "Cảm ơn bạn đã nộp hồ sơ xét tuyển vào \"" + universityName + "\" - ngành \"" + majorName
                        + "\".\n"
                        + "Hồ sơ của bạn đã được tiếp nhận thành công vào: " + submittedAt + "\n"
                        + "Mã hồ sơ: " + applicationCode + "\n\n"
                        + "Bước tiếp theo: Phòng Tuyển Sinh sẽ kiểm tra hồ sơ trong vòng 3-5 ngày làm việc.\n\n"
                        + "Nếu cần hỗ trợ, liên hệ: tuyensinh@uniadmission.example hoặc (+84) 0123-456-789.\n\n"
                        + "Trân trọng,\nPhòng Tuyển Sinh — UniAdmission";
                message.setText(content);
                sendSimpleMessageWithRetry(message, "application submitted fallback email");
            } catch (Exception e) {
                log.error("Gửi email fallback thất bại: {}", e.getMessage());
            }
        }
    }

    private String escapeHtml(String input) {
        if (input == null)
            return "";
        return input.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#x27;");
    }

    @Override
    public void sendEmailVerificationEmail(String to, String candidateName, String verificationUrl) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            try {
                helper.setFrom(fromAddress, "UniAdmission");
            } catch (UnsupportedEncodingException uee) {
                helper.setFrom(fromAddress);
            }
            helper.setTo(to);
            helper.setSubject("[UniAdmission] Xác minh email tài khoản");

            Map<String, Object> variables = new HashMap<>();
            variables.put("candidateName", candidateName);
            variables.put("verificationUrl", verificationUrl);
            String html = renderTemplate("email/email-verification", variables);

            helper.setText(html, true);
            sendMimeMessageWithRetryOrThrow(mimeMessage, "email verification email");
        } catch (MessagingException ex) {
            log.warn("Không gửi được email xác minh HTML, thử gửi text fallback: {}", ex.getMessage());
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(to);
                message.setSubject("Xác minh email tài khoản UniAdmission");

                String content = "Chào " + candidateName + ",\n\n"
                        + "Cảm ơn bạn đã đăng ký tài khoản UniAdmission. Vui lòng mở link sau để xác minh email và kích hoạt tài khoản:\n"
                        + verificationUrl + "\n\n"
                        + "Nếu bạn không yêu cầu tạo tài khoản, hãy bỏ qua email này.\n\n"
                        + "Trân trọng,\nUniAdmission";

                message.setText(content);
                sendSimpleMessageWithRetryOrThrow(message, "email verification fallback email");
            } catch (Exception e) {
                log.error("Gửi email xác minh fallback thất bại: {}", e.getMessage());
            }
        }
    }

    private void sendMimeMessageWithRetry(MimeMessage mimeMessage, String context) {
        retrySend(() -> mailSender.send(mimeMessage), context);
    }

    private void sendSimpleMessageWithRetry(SimpleMailMessage message, String context) {
        retrySend(() -> mailSender.send(message), context);
    }

    private void sendMimeMessageWithRetryOrThrow(MimeMessage mimeMessage, String context) {
        retrySendOrThrow(() -> mailSender.send(mimeMessage), context);
    }

    private void sendSimpleMessageWithRetryOrThrow(SimpleMailMessage message, String context) {
        retrySendOrThrow(() -> mailSender.send(message), context);
    }

    private void retrySend(Runnable sendAction, String context) {
        int maxAttempts = 3;
        long[] backoffs = new long[] { 250L, 750L };

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                sendAction.run();
                if (attempt > 1) {
                    log.info("Đã gửi thành công {} sau {} lần thử", context, attempt);
                }
                return;
            } catch (Exception ex) {
                log.warn("Gửi {} thất bại ở lần {}: {}", context, attempt, ex.getMessage());
                if (attempt >= maxAttempts) {
                    log.error("Gửi {} thất bại sau {} lần thử", context, maxAttempts, ex);
                    return;
                }

                try {
                    Thread.sleep(backoffs[attempt - 1]);
                } catch (InterruptedException interruptedException) {
                    Thread.currentThread().interrupt();
                    log.warn("Retry của {} bị ngắt", context);
                    return;
                }
            }
        }
    }

    private void retrySendOrThrow(Runnable sendAction, String context) {
        int maxAttempts = 3;
        long[] backoffs = new long[] { 250L, 750L };

        Exception lastException = null;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                sendAction.run();
                if (attempt > 1) {
                    log.info("Đã gửi thành công {} sau {} lần thử", context, attempt);
                }
                return;
            } catch (Exception ex) {
                lastException = ex;
                log.warn("Gửi {} thất bại ở lần {}: {}", context, attempt, ex.getMessage());
                if (attempt < maxAttempts) {
                    try {
                        Thread.sleep(backoffs[attempt - 1]);
                    } catch (InterruptedException interruptedException) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry của " + context + " bị ngắt", interruptedException);
                    }
                }
            }
        }

        throw new RuntimeException("Gửi " + context + " thất bại sau " + maxAttempts + " lần thử", lastException);
    }

    private String renderTemplate(String templateName, Map<String, Object> variables) {
        Context context = new Context(Locale.forLanguageTag("vi-VN"));
        context.setVariables(variables);
        return templateEngine.process(templateName, context);
    }

    private String buildFrontendUrl(String path) {
        String baseUrl = frontendBaseUrl == null ? "" : frontendBaseUrl.trim();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        if (path == null || path.isEmpty()) {
            return baseUrl;
        }
        return path.startsWith("/") ? baseUrl + path : baseUrl + "/" + path;
    }

    @Override
    @Async
    public void sendCustomEmail(String to, String subject, String message, boolean html) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            try {
                helper.setFrom(fromAddress, "UniAdmission");
            } catch (UnsupportedEncodingException uee) {
                helper.setFrom(fromAddress);
            }
            helper.setTo(to);
            helper.setSubject(subject != null ? subject : "[UniAdmission]");
            helper.setText(message != null ? message : "", html);
            sendMimeMessageWithRetry(mimeMessage, "custom email");
        } catch (MessagingException ex) {
            log.warn("Không gửi được email tùy chỉnh HTML, thử gửi text fallback: {}", ex.getMessage());
            try {
                SimpleMailMessage fallbackMessage = new SimpleMailMessage();
                fallbackMessage.setFrom(fromAddress);
                fallbackMessage.setTo(to);
                fallbackMessage.setSubject(subject != null ? subject : "[UniAdmission]");
                fallbackMessage.setText(message != null ? message : "");
                sendSimpleMessageWithRetry(fallbackMessage, "custom email fallback");
            } catch (Exception e) {
                log.error("Gửi email tùy chỉnh fallback thất bại: {}", e.getMessage());
            }
        }
    }

    @Override
    @Async
    public void sendApplicationStatusEmail(String to, String candidateName, String status) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            try {
                helper.setFrom(fromAddress, "UniAdmission");
            } catch (UnsupportedEncodingException uee) {
                helper.setFrom(fromAddress);
            }
            helper.setTo(to);
            helper.setSubject("[UniAdmission] Thông báo cập nhật trạng thái hồ sơ");

            String updatedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            Map<String, Object> variables = new HashMap<>();
            variables.put("candidateName", candidateName);
            variables.put("status", status);
            variables.put("updatedAt", updatedAt);
            variables.put("loginUrl", buildFrontendUrl("/login"));
            String html = renderTemplate("email/application-status", variables);

            helper.setText(html, true);
            sendMimeMessageWithRetry(mimeMessage, "application status email");
        } catch (MessagingException ex) {
            log.warn("Không gửi được email HTML cho trạng thái, thử gửi text fallback: {}", ex.getMessage());
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(to);
                message.setSubject("Thông báo kết quả xét tuyển Đại học");

                String content = "Chào " + candidateName + ",\n\n"
                        + "Hồ sơ xét tuyển của bạn đã được cập nhật trạng thái thành: " + status + ".\n\n"
                        + "Vui lòng đăng nhập vào hệ thống để xem chi tiết.\n"
                        + "Trân trọng,\nPhòng Tuyển Sinh.";

                message.setText(content);
                sendSimpleMessageWithRetry(message, "application status fallback email");
            } catch (Exception e) {
                log.error("Gửi email trạng thái fallback thất bại: {}", e.getMessage());
            }
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String resetCode) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            try {
                helper.setFrom(fromAddress, "UniAdmission");
            } catch (UnsupportedEncodingException uee) {
                helper.setFrom(fromAddress);
            }
            helper.setTo(to);
            helper.setSubject("[UniAdmission] Yêu cầu khôi phục mật khẩu");

            Map<String, Object> variables = new HashMap<>();
            variables.put("resetCode", resetCode);
            variables.put("resetUrl", buildFrontendUrl("/reset-password?code=" + resetCode));
            String html = renderTemplate("email/password-reset", variables);

            helper.setText(html, true);
            sendMimeMessageWithRetry(mimeMessage, "password reset email");
        } catch (MessagingException ex) {
            log.warn("Không gửi được email HTML khôi phục mật khẩu, thử gửi text fallback: {}", ex.getMessage());
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(to);
                message.setSubject("Khôi phục mật khẩu tài khoản UniAdmission");

                String content = "Xin chào,\n\n"
                        + "Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.\n"
                        + "Mã xác thực của bạn là: " + resetCode + "\n\n"
                        + "Mã này có hiệu lực trong 15 phút.\n"
                        + "Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email này.\n\n"
                        + "Trân trọng,\nUniAdmission.";

                message.setText(content);
                sendSimpleMessageWithRetry(message, "password reset fallback email");
            } catch (Exception e) {
                log.error("Gửi email khôi phục mật khẩu fallback thất bại: {}", e.getMessage());
            }
        }
    }
}
