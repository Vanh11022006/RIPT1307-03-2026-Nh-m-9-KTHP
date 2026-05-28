package com.uniadmission.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uniadmission.backend.dto.LoginRequest;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.repository.CandidateRepository;
import com.uniadmission.backend.repository.RefreshTokenRepository;
import com.uniadmission.backend.repository.UserRepository;
import com.uniadmission.backend.security.JwtTokenProvider;
import com.uniadmission.backend.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = "app.frontend.base-url=http://localhost:5173")
@Import(com.uniadmission.backend.listener.EmailVerificationListener.class)
@org.springframework.boot.test.mock.mockito.MockBean(com.uniadmission.backend.security.CustomUserDetailsService.class)
@org.springframework.boot.test.mock.mockito.MockBean(com.uniadmission.backend.security.JwtTokenProvider.class)
class AuthControllerRegisterIntegrationTest {

    @Autowired
    private AuthController authController;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CandidateRepository candidateRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private RefreshTokenRepository refreshTokenRepository;

    @MockBean
    private EmailService emailService;

    @Test
    void register_buildsAbsoluteVerificationLink() throws Exception {
        when(userRepository.existsByEmail("student@example.com")).thenReturn(false);
        when(passwordEncoder.encode("P@ssw0rd123")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(candidateRepository.saveAndFlush(any(Candidate.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        String body = objectMapper.writeValueAsString(new java.util.LinkedHashMap<String, Object>() {
            {
                put("fullName", "Nguyen Van A");
                put("email", "student@example.com");
                put("password", "P@ssw0rd123");
                put("phone", "0912345678");
            }
        });

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isOk())
                .andReturn();

        long start = System.currentTimeMillis();
        while (org.mockito.Mockito.mockingDetails(emailService).getInvocations().isEmpty()
                && System.currentTimeMillis() - start < 2000) {
            Thread.sleep(50);
        }

        byte[] raw = result.getResponse().getContentAsByteArray();
        String content = new String(raw, java.nio.charset.StandardCharsets.UTF_8);
        assertThat(content).contains("Vui lòng kiểm tra email để xác minh tài khoản");
        org.mockito.ArgumentCaptor<String> linkCaptor = org.mockito.ArgumentCaptor.forClass(String.class);
        org.mockito.Mockito.verify(emailService).sendEmailVerificationEmail(
                anyString(),
                anyString(),
                linkCaptor.capture());
        assertThat(linkCaptor.getValue()).startsWith("http://localhost:5173/verify-email?token=");
    }

    @Test
    void login_allowsAdminWithoutEmailVerification() throws Exception {
        User admin = new User();
        admin.setId(1L);
        admin.setEmail("admin@example.com");
        admin.setPassword("encoded-password");
        admin.setFullName("System Admin");
        admin.setRole("admin");
        admin.setStatus("active");
        admin.setEmailVerified(false);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(java.util.Optional.of(admin));
        when(passwordEncoder.matches("123456", "encoded-password")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken("admin@example.com")).thenReturn("access-token");

        LoginRequest request = new LoginRequest();
        request.setEmail("admin@example.com");
        request.setPassword("123456");
        request.setRemember(false);

        org.springframework.http.ResponseEntity<com.uniadmission.backend.dto.ApiResponse<Object>> response = authController
                .login(request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
    }
}
