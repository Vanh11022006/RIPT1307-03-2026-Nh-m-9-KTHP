package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Override
    public void sendApplicationStatusEmail(String to, String candidateName, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Thông báo kết quả xét tuyển Đại học");

        String content = "Chào " + candidateName + ",\n\n"
                + "Hồ sơ xét tuyển của bạn đã được cập nhật trạng thái thành: " + status + ".\n\n"
                + "Vui lòng đăng nhập vào hệ thống để xem chi tiết.\n"
                + "Trân trọng,\nPhòng Tuyển Sinh.";

        message.setText(content);
        mailSender.send(message);
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String resetCode) {
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
        mailSender.send(message);
    }
}
