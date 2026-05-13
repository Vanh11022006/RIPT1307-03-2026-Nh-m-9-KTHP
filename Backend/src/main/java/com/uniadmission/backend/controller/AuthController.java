package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.ApiResponse;
import com.uniadmission.backend.dto.LoginRequest;
import com.uniadmission.backend.dto.LoginResponse;
import com.uniadmission.backend.dto.RegisterRequest;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.repository.UserRepository;
import com.uniadmission.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Quan trọng: Cho phép Frontend ReactJS gọi chéo cổng 8080 mà không bị lỗi CORS
public class AuthController {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private CandidateRepository candidateRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<Object>> login(@RequestBody LoginRequest request) {
                Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

                if (!userOpt.isPresent()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Email hoặc mật khẩu không đúng!", null));
                }

                User user = userOpt.get();

                // Kiểm tra mật khẩu (Hỗ trợ cả trường hợp password đã hash và chưa hash trong
                // DB)
                boolean isPasswordMatch = passwordEncoder.matches(request.getPassword(), user.getPassword())
                                || request.getPassword().equals(user.getPassword());

                if (!isPasswordMatch) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Email hoặc mật khẩu không đúng!", null));
                }

                if ("inactive".equals(user.getStatus())) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Tài khoản của bạn đã bị khóa!", null));
                }

                String token = jwtTokenProvider.generateToken(user.getEmail());
                LoginResponse responseData = new LoginResponse(token, user);
                return ResponseEntity.ok(new ApiResponse<>(true, "Đăng nhập thành công!", responseData));
        }

        @PostMapping("/register")
        @Transactional
        public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request) {
                // 1. Kiểm tra email đã đăng ký chưa
                if (userRepository.existsByEmail(request.getEmail())) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Email này đã được đăng ký!", null));
                }

                // 2. Tạo User mới
                User user = new User();
                user.setFullName(request.getFullName());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword())); // Đã Hash mật khẩu an toàn
                user.setPhone(request.getPhone());
                user.setRole("candidate"); // Mặc định là role thí sinh
                user.setStatus("active");

                // 3. Lưu xuống Database MySQL
                userRepository.saveAndFlush(user);

                Candidate candidate = new Candidate();
                candidate.setUser(user);
                candidate.setPhone(request.getPhone());
                candidateRepository.saveAndFlush(candidate);

                return ResponseEntity.ok(new ApiResponse<>(true, "Đăng ký tài khoản thành công!", user));
        }
}
