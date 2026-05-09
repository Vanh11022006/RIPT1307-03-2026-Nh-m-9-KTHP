package com.uniadmission.backend.entity;

import com.uniadmission.backend.entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_review_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus statusAfterReview;

    @Column(columnDefinition = "TEXT")
    private String note;

    private LocalDateTime reviewDate;
}