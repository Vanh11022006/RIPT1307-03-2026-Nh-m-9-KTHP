package com.uniadmission.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CandidateProfileRequest {
    private String phone;
    private String address;
    private String citizenId;
    private LocalDate birthDate;
    private String gender;
    private String highSchoolName;
}