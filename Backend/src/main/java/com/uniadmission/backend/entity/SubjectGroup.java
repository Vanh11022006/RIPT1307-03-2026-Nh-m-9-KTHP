package com.uniadmission.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subject_groups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String subjects;
}