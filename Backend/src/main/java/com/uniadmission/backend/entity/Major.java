package com.uniadmission.backend.entity;

import com.uniadmission.backend.entity.enums.EntityStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "majors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Major {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "university_id")
    private University university;

    private String code;
    private String name;
    private Double benchmarkScore;

    @Enumerated(EnumType.STRING)
    private EntityStatus status;
}