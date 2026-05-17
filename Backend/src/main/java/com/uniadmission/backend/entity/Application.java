package com.uniadmission.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.uniadmission.backend.entity.enums.ApplicationStatus;
import javax.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "candidate_id")
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "major_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Major major;

    @ManyToOne
    @JoinColumn(name = "admission_round_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private AdmissionRound admissionRound;

    @ManyToOne
    @JoinColumn(name = "subject_group_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private SubjectGroup subjectGroup;

    private String applicationCode;

    private Double totalScore;
    private String priorityGroup;
    private Double priorityScore;
    @Column(columnDefinition = "text")
    private String scores;
    private LocalDateTime submissionDate;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Attachment> attachments;

}
