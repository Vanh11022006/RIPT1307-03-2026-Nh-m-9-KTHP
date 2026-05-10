package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendApplicationStatusEmail(String to, String candidateName, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Thông báo kết quả xét tuyển Đại học");

        String content = "Chào " + candidateName + ",\n\n"
                + "Hồ sơ xét tuyển của bạn đã được cập nhật trạng thái thành: " + status + ".\n\n"
                + "Vui lòng đăng nhập vào hệ thống để xem chi tiết.\n"
                + "Trân trọng,\nPhòng Tuyển Sinh.";

        message.setText(content);
        mailSender.send(message);
    }
}