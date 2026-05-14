package com.uniadmission.backend.dto.request;

import lombok.Data;

@Data
public class CandidateProfileRequest {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String citizenId;
    private String dateOfBirth;
    private String gender;
    private String city;
    private String highSchool;
    private Integer graduationYear;
}
