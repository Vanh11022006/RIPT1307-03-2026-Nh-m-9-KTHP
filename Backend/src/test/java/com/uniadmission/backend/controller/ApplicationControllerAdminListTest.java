package com.uniadmission.backend.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.uniadmission.backend.entity.Application;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.AttachmentRepository;
import com.uniadmission.backend.security.CustomUserDetailsService;
import com.uniadmission.backend.security.JwtTokenProvider;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.FileService;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ApplicationControllerAdminListTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ApplicationService applicationService;

    @MockBean
    private FileService fileService;

    @MockBean
    private AttachmentRepository attachmentRepository;

    @MockBean
    private ApplicationRepository applicationRepository;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void adminList_acceptsUniversityMajorAndAdmissionRoundFilters() throws Exception {
        Application application = new Application();
        application.setId(1L);
        application.setApplicationCode("HS20260001");

        List<Application> applications = new ArrayList<>();
        applications.add(application);
        Page<Application> page = new PageImpl<>(applications, PageRequest.of(2, 25), 1);

        when(applicationService.getApplicationsForAdmin(
                eq(ApplicationStatus.PENDING),
                eq(12L),
                eq(34L),
                eq(56L),
                eq(2),
                eq(25))).thenReturn(page);

        mockMvc.perform(get("/api/applications/admin-list")
                .param("status", "pending")
                .param("universityId", "12")
                .param("majorId", "34")
                .param("admissionRoundId", "56")
                .param("page", "2")
                .param("size", "25")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].applicationCode").value("HS20260001"));

        verify(applicationService).getApplicationsForAdmin(
                eq(ApplicationStatus.PENDING),
                eq(12L),
                eq(34L),
                eq(56L),
                eq(2),
                eq(25));
    }
}