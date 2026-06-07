package com.uniadmission.backend.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.Candidate;
import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.UserRepository;
import com.uniadmission.backend.security.CustomUserDetailsService;
import com.uniadmission.backend.security.JwtTokenProvider;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.EmailService;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminControllerBulkEmailTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private ApplicationRepository applicationRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private EmailService emailService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void bulkEmail_sendsCustomEmailToSelectedApplications() throws Exception {
        User user = new User();
        user.setId(11L);
        user.setEmail("candidate1@example.com");
        user.setFullName("Ứng viên 1");
        user.setPassword("secret");
        user.setRole("candidate");
        user.setStatus("active");

        Candidate candidate = new Candidate();
        candidate.setId(21L);
        candidate.setUser(user);

        Application application = new Application();
        application.setId(101L);
        application.setCandidate(candidate);

        when(applicationRepository.findAllById(any()))
                .thenReturn(Arrays.asList(application));

        mockMvc.perform(post("/api/admin/bulk-email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"applicationIds\":[101,102],\"subject\":\"Thông báo\",\"message\":\"Nội dung gửi hàng loạt\",\"html\":false,\"adminId\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.recipientCount").value(1))
                .andExpect(jsonPath("$.data.skippedApplicationIds[0]").value(102));

        verify(emailService).sendCustomEmail("candidate1@example.com", "Thông báo", "Nội dung gửi hàng loạt",
                false);
    }
}