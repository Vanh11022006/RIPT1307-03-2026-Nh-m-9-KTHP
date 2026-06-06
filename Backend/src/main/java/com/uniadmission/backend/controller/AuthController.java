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
import com.uniadmission.backend.event.EmailVerificationRequestedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import com.uniadmission.backend.util.HashUtil;
import java.util.concurrent.ThreadLocalRandom;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Đăng nhập, đăng ký và khôi phục mật khẩu")
public class AuthController {

        @org.springframework.beans.factory.annotation.Value("${app.frontend.base-url:http://localhost:5173}")
        private String frontendBaseUrl;

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
        private com.uniadmission.backend.service.EmailService emailService;

        @Autowired
        private ApplicationEventPublisher eventPublisher;

        @PostMapping("/login")
        @Transactional
        @Operation(summary = "Đăng nhập", description = "Xác thực người dùng và trả về access token / refresh token")
        @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginRequest.class), examples = @ExampleObject(name = "LoginExample", value = "{\"email\":\"student@example.com\",\"password\":\"P@ssw0rd123\",\"remember\":true}")))
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đăng nhập thành công", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = "{\"success\":true,\"message\":\"Đăng nhập thành công!\",\"data\":{\"token\":\"eyJhbGciOi...\",\"refreshToken\":\"eyJhbGciOi...\",\"user\":{\"id\":1,\"fullName\":\"Nguyen Van A\",\"email\":\"student@example.com\",\"role\":\"candidate\"}}}"))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Sai email hoặc mật khẩu")
        })
        public ResponseEntity<ApiResponse<Object>> login(@RequestBody LoginRequest request) {
                Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

                if (!userOpt.isPresent()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Email hoặc mật khẩu không đúng!", null));
                }

                User user = userOpt.get();

                boolean isPasswordMatch = request.getPassword() != null
                                && passwordEncoder.matches(request.getPassword(), user.getPassword());

                if (!isPasswordMatch) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Email hoặc mật khẩu không đúng!", null));
                }

                boolean isAdminAccount = "admin".equalsIgnoreCase(user.getRole())
                                || "admin@example.com".equalsIgnoreCase(user.getEmail());
                boolean requiresEmailVerification = !isAdminAccount;
                if (requiresEmailVerification && !user.isEmailVerified()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false,
                                                        "Tài khoản chưa được xác minh email. Vui lòng kiểm tra hộp thư của bạn.",
                                                        null));
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
        @Operation(summary = "Làm mới token", description = "Đổi refresh token hợp lệ lấy access token mới")
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
        @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản thí sinh mới và hồ sơ candidate đi kèm")
        @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = RegisterRequest.class), examples = @ExampleObject(name = "RegisterExample", value = "{\"fullName\":\"Nguyen Van A\",\"email\":\"student@example.com\",\"password\":\"P@ssw0rd123\",\"phone\":\"0912345678\"}")))
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
                user.setStatus("pending_verification");
                user.setEmailVerified(false);
                String verificationToken = UUID.randomUUID().toString();
                user.setEmailVerificationToken(verificationToken);
                user.setEmailVerificationExpires(LocalDateTime.now().plusHours(24));

                userRepository.saveAndFlush(user);

                Candidate candidate = new Candidate();
                candidate.setUser(user);
                candidate.setPhone(request.getPhone());
                candidateRepository.saveAndFlush(candidate);

                String verificationLink = buildFrontendUrl("/verify-email?token=" + verificationToken);
                eventPublisher.publishEvent(new EmailVerificationRequestedEvent(
                                user.getEmail(),
                                user.getFullName(),
                                verificationLink));

                return ResponseEntity.ok(new ApiResponse<>(true,
                                "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.", user));
        }

        @GetMapping("/verify-email")
        @Transactional
        @Operation(summary = "Xác minh email", description = "Kích hoạt tài khoản bằng token xác minh email")
        public ResponseEntity<ApiResponse<Object>> verifyEmail(@RequestParam String token) {
                if (token == null || token.trim().isEmpty()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Token xác minh không được để trống!", null));
                }

                Optional<User> userOpt = userRepository.findByEmailVerificationToken(token);
                if (!userOpt.isPresent()) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Token xác minh không hợp lệ!", null));
                }

                User user = userOpt.get();
                if (user.getEmailVerificationExpires() == null
                                || user.getEmailVerificationExpires().isBefore(LocalDateTime.now())) {
                        return ResponseEntity.badRequest()
                                        .body(new ApiResponse<>(false, "Token xác minh đã hết hạn!", null));
                }

                user.setEmailVerified(true);
                user.setEmailVerificationToken(null);
                user.setEmailVerificationExpires(null);
                if (user.getStatus() == null || "pending_verification".equals(user.getStatus())) {
                        user.setStatus("active");
                }
                userRepository.save(user);

                return ResponseEntity.ok(new ApiResponse<>(true, "Xác minh email thành công!", null));
        }

        @PostMapping("/forgot-password")
        @Transactional
        @Operation(summary = "Gửi mã quên mật khẩu", description = "Tạo mã khôi phục và gửi email cho người dùng")
        @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = ForgotPasswordRequest.class), examples = @ExampleObject(name = "ForgotPasswordExample", value = "{\"email\":\"student@example.com\"}")))
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
        @Operation(summary = "Đặt lại mật khẩu", description = "Xác thực mã khôi phục và cập nhật mật khẩu mới")
        @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResetPasswordRequest.class), examples = @ExampleObject(name = "ResetPasswordExample", value = "{\"token\":\"4821\",\"email\":\"student@example.com\",\"newPassword\":\"NewPassword123!\",\"confirmPassword\":\"NewPassword123!\"}")))
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
}
