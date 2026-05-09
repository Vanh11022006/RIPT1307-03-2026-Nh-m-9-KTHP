package com.uniadmission.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evidence_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationEvidenceFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    private String fileName;
    private String fileUrl;
    private String category;
}