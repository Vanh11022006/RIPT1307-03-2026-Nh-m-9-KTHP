package com.uniadmission.backend.controller;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.uniadmission.backend.repository.ApplicationRepository;
import com.uniadmission.backend.repository.AttachmentRepository;
import com.uniadmission.backend.security.CustomUserDetailsService;
import com.uniadmission.backend.security.JwtTokenProvider;
import com.uniadmission.backend.service.ApplicationService;
import com.uniadmission.backend.service.FileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
class ApplicationControllerBulkActionsTest {

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
    void adminBulkStatus_convertsStatusAndPassesIdsToService() throws Exception {
        mockMvc.perform(post("/api/applications/admin-bulk-status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ids\":[1,2],\"status\":\"approved\",\"notes\":\"OK\",\"adminId\":99}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(applicationService).bulkUpdateApplicationStatus(anyList(),
                eq(com.uniadmission.backend.entity.enums.ApplicationStatus.APPROVED), eq("OK"), eq(99L));
    }

    @Test
    void adminExportCsv_returnsCsvAttachment() throws Exception {
        when(applicationService.exportApplicationsCsv(
                eq(com.uniadmission.backend.entity.enums.ApplicationStatus.PENDING), eq(1L), eq(2L), eq(3L)))
                .thenReturn("ID,Mã hồ sơ\n1,HS20260001\n");

        mockMvc.perform(get("/api/applications/admin-export-csv")
                .param("status", "pending")
                .param("universityId", "1")
                .param("majorId", "2")
                .param("admissionRoundId", "3")
                .accept(MediaType.valueOf("text/csv")))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.valueOf("text/csv")))
                .andExpect(content().string("ID,Mã hồ sơ\n1,HS20260001\n"));

        verify(applicationService).exportApplicationsCsv(
                eq(com.uniadmission.backend.entity.enums.ApplicationStatus.PENDING), eq(1L), eq(2L), eq(3L));
    }
}