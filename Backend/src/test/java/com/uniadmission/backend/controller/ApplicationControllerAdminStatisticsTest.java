package com.uniadmission.backend.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.uniadmission.backend.dto.response.statistics.ApplicationStatisticsGroupResponse;
import com.uniadmission.backend.dto.response.statistics.ApplicationStatisticsResponse;
import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.AttachmentRepository;
import com.uniadmission.backend.security.CustomUserDetailsService;
import com.uniadmission.backend.security.JwtTokenProvider;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.FileService;
import java.util.Arrays;
import java.util.HashMap;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ApplicationControllerAdminStatisticsTest {

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
    void adminStatistics_acceptsUniversityMajorAndAdmissionRoundFilters() throws Exception {
        ApplicationStatisticsResponse stats = ApplicationStatisticsResponse.builder()
                .total(8L)
                .pending(3L)
                .approved(3L)
                .rejected(1L)
                .cancelled(1L)
                .byUniversity(Arrays.asList(ApplicationStatisticsGroupResponse.builder()
                        .id(12L)
                        .code("UNI01")
                        .name("Đại học A")
                        .total(8L)
                        .pending(3L)
                        .approved(3L)
                        .rejected(1L)
                        .cancelled(1L)
                        .build()))
                .byMajor(Arrays.asList())
                .byAdmissionRound(Arrays.asList())
                .build();

        when(applicationService.getApplicationStatistics(eq(12L), eq(34L), eq(56L)))
                .thenReturn(stats);

        mockMvc.perform(get("/api/applications/admin-statistics")
                .param("universityId", "12")
                .param("majorId", "34")
                .param("admissionRoundId", "56")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.total").value(8))
                .andExpect(jsonPath("$.data.pending").value(3))
                .andExpect(jsonPath("$.data.byUniversity[0].name").value("Đại học A"));

        verify(applicationService).getApplicationStatistics(eq(12L), eq(34L), eq(56L));
    }
}