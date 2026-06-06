package com.uniadmission.backend.config;

import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@example.com}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.admin.full-name:System Admin}")
    private String adminFullName;

    @Value("${app.admin.phone:0900000001}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        if (!StringUtils.hasText(adminEmail)) {
            log.warn("Skipping admin seed because app.admin.email is empty");
            return;
        }

        java.util.Optional<User> existing = userRepository.findByEmail(adminEmail);
        if (!StringUtils.hasText(adminPassword)) {
            if (existing.isEmpty()) {
                log.warn("Skipping admin seed because ADMIN_PASSWORD is not set");
            }
            return;
        }

        User admin = existing.orElseGet(User::new);
        admin.setFullName(adminFullName);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole("admin");
        admin.setStatus("active");
        admin.setEmailVerified(true);
        admin.setEmailVerificationToken(null);
        admin.setEmailVerificationExpires(null);
        admin.setPhone(adminPhone);
        userRepository.save(admin);
    }
}
