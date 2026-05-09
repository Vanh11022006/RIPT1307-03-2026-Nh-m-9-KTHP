package com.uniadmission.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phone;
    private String address;
    private String citizenId;
    private LocalDate birthDate;
    private String gender;
    private String highSchoolName;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}