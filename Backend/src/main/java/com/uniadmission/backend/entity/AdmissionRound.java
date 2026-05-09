package com.uniadmission.backend.entity;

import com.uniadmission.backend.entity.enums.AdmissionRoundStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admission_rounds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionRound {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private AdmissionRoundStatus status;
}