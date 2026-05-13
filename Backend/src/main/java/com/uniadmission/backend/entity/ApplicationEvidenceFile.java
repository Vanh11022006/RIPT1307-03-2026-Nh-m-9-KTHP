package com.uniadmission.backend.entity;

import javax.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Application application;

    private String fileName;
    private String fileUrl;
    private String category;
}
