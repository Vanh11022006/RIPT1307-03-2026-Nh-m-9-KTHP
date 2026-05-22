package com.uniadmission.backend.controller;

import com.uniadmission.backend.dto.ApiResponse;
import com.uniadmission.backend.dto.LoginRequest;
import com.uniadmission.backend.dto.LoginResponse;
import com.uniadmission.backend.dto.RegisterRequest;
import com.uniadmission.backend.dto.request.ForgotPasswordRequest;
import com.uniadmission.backend.dto.request.ResetPasswordRequest;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.repository.UserRepository;
import com.uniadmission.backend.security.JwtTokenProvider;
import com.uniadmission.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import com.uniadmission.backend.util.HashUtil;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private CandidateRepository candidateRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        @Autowired
        private com.uniadmission.backend.repository.RefreshTokenRepository refreshTokenRepository;

        @Autowired
        private EmailService emailService;

        @PostMapping("/login")
        @Transactional
        public ResponseEntity<ApiResponse<Object>> login(@RequestBody LoginRequest request) {
                Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

                if (!userOpt.isPresent()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Email hoặc mật khẩu không đúng!", null));
                }

                User user = userOpt.get();

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

                String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
                String refreshToken = null;
                if (request.getRemember() != null && request.getRemember()) {
                        refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

                        com.uniadmission.backend.entity.RefreshToken rt = new com.uniadmission.backend.entity.RefreshToken();
                        String tokenHash = HashUtil.sha256Hex(refreshToken);
                        rt.setTokenHash(tokenHash);
                        rt.setUser(user);
                        rt.setExpiryDate(java.time.Instant.now().plusMillis(7L * 24 * 60 * 60 * 1000));
                        rt.setRevoked(false);

                        refreshTokenRepository.deleteByUser(user);
                        refreshTokenRepository.save(rt);
                }

                LoginResponse responseData = new LoginResponse();
                responseData.setToken(accessToken);
                responseData.setRefreshToken(refreshToken);
                responseData.setUser(user);
                return ResponseEntity.ok(new ApiResponse<>(true, "Đăng nhập thành công!", responseData));
        }

        @PostMapping("/refresh-token")
        @Transactional
        public ResponseEntity<ApiResponse<Object>> refreshToken(@RequestBody java.util.Map<String, String> body) {
                String refresh = body.get("refreshToken");
                if (refresh == null) {
                        return ResponseEntity.status(401).body(
                                        new ApiResponse<>(false, "Refresh token không hợp lệ hoặc đã hết hạn", null));
                }

                String incomingHash = HashUtil.sha256Hex(refresh);
                java.util.Optional<com.uniadmission.backend.entity.RefreshToken> stored = refreshTokenRepository
                                .findByTokenHash(incomingHash);
                if (!stored.isPresent()) {
                        return ResponseEntity.status(401).body(
                                        new ApiResponse<>(false, "Refresh token không hợp lệ hoặc đã bị thu hồi",
                                                        null));
                }

                com.uniadmission.backend.entity.RefreshToken storedToken = stored.get();
                if (storedToken.isRevoked() || storedToken.getExpiryDate().isBefore(java.time.Instant.now())) {
                        return ResponseEntity.status(401).body(
                                        new ApiResponse<>(false, "Refresh token không hợp lệ hoặc đã hết hạn", null));
                }

                if (!jwtTokenProvider.validateToken(refresh)) {
                        return ResponseEntity.status(401).body(
                                        new ApiResponse<>(false, "Refresh token không hợp lệ hoặc đã hết hạn", null));
                }

                String email = jwtTokenProvider.getUsernameFromJWT(refresh);
                String newAccess = jwtTokenProvider.generateAccessToken(email);

                String newRefresh = jwtTokenProvider.generateRefreshToken(email);

                storedToken.setRevoked(true);
                refreshTokenRepository.save(storedToken);

                com.uniadmission.backend.entity.RefreshToken newRt = new com.uniadmission.backend.entity.RefreshToken();
                String newHash = HashUtil.sha256Hex(newRefresh);
                newRt.setTokenHash(newHash);
                newRt.setUser(storedToken.getUser());
                newRt.setExpiryDate(java.time.Instant.now().plusMillis(7L * 24 * 60 * 60 * 1000));
                newRt.setRevoked(false);
                int saveAttempts = 0;
                final int SAVE_MAX_ATTEMPTS = 5;
                boolean saved = false;
                while (!saved && saveAttempts < SAVE_MAX_ATTEMPTS) {
                        try {
                                refreshTokenRepository.save(newRt);
                                saved = true;
                        } catch (DataIntegrityViolationException dive) {
                                saveAttempts++;
                                String alt = jwtTokenProvider.generateRefreshToken(email);
                                newRefresh = alt;
                                newHash = HashUtil.sha256Hex(newRefresh);
                                newRt.setTokenHash(newHash);
                        }
                }
                if (!saved) {
                        return ResponseEntity.status(500).body(
                                        new ApiResponse<>(false, "Unable to persist refresh token, try again later",
                                                        null));
                }

                java.util.Map<String, String> result = new java.util.HashMap<>();
                result.put("accessToken", newAccess);
                result.put("refreshToken", newRefresh);
                return ResponseEntity.ok(new ApiResponse<>(true, "Refresh success", result));
        }

        @PostMapping("/register")
        @Transactional
        public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Email này đã được đăng ký!", null));
                }

                User user = new User();
                user.setFullName(request.getFullName());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setPhone(request.getPhone());
                user.setRole("candidate");
                user.setStatus("active");

                userRepository.saveAndFlush(user);

                Candidate candidate = new Candidate();
                candidate.setUser(user);
                candidate.setPhone(request.getPhone());
                candidateRepository.saveAndFlush(candidate);

                return ResponseEntity.ok(new ApiResponse<>(true, "Đăng ký tài khoản thành công!", user));
        }

        @PostMapping("/forgot-password")
        @Transactional
        public ResponseEntity<ApiResponse<Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
                Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
                if (!userOpt.isPresent()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false,
                                                        "Không tìm thấy tài khoản với email này!", null));
                }

                User user = userOpt.get();
                String resetToken = String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
                LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);

                user.setResetPasswordToken(resetToken);
                user.setResetPasswordExpires(expiresAt);
                userRepository.save(user);

                emailService.sendPasswordResetEmail(user.getEmail(), resetToken);

                return ResponseEntity.ok(new ApiResponse<>(true,
                                "Đã gửi mã khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
                                null));
        }

        @PostMapping("/reset-password")
        @Transactional
        public ResponseEntity<ApiResponse<Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
                if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Email không được để trống!", null));
                }

                if (request.getNewPassword() == null
                                || !request.getNewPassword().equals(request.getConfirmPassword())) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Mật khẩu xác nhận không khớp!", null));
                }

                Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
                if (!userOpt.isPresent()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Không tìm thấy tài khoản với email này!",
                                                        null));
                }

                User user = userOpt.get();
                if (request.getToken() == null || !request.getToken().equals(user.getResetPasswordToken())) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Mã khôi phục không đúng!", null));
                }

                if (user.getResetPasswordExpires() == null
                                || user.getResetPasswordExpires().isBefore(LocalDateTime.now())) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Mã khôi phục đã hết hạn!", null));
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                user.setResetPasswordToken(null);
                user.setResetPasswordExpires(null);
                userRepository.save(user);

                return ResponseEntity.ok(new ApiResponse<>(true, "Đặt lại mật khẩu thành công!", null));
        }
}
