package com.uniadmission.backend.config;

import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        java.util.Optional<User> existing = userRepository.findByEmail("admin@example.com");
        if (existing.isPresent()) {
            User admin = existing.get();
            admin.setFullName("System Admin");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setRole("admin");
            admin.setStatus("active");
            admin.setEmailVerified(true);
            admin.setEmailVerificationToken(null);
            admin.setEmailVerificationExpires(null);
            admin.setPhone("0900000001");
            userRepository.save(admin);
        } else {
            User admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setRole("admin");
            admin.setStatus("active");
            admin.setEmailVerified(true);
            admin.setPhone("0900000001");
            userRepository.save(admin);
        }
    }
}
