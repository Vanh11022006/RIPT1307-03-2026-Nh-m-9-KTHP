package com.uniadmission.backend.entity;

import com.uniadmission.backend.entity.enums.ApplicationReviewActionType;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_review_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "reviewer_id", nullable = false)
    private Long adminId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type")
    private ApplicationReviewActionType actionType;

    @Column(name = "old_status")
    private String oldStatus;

    @Column(name = "new_status", nullable = false)
    private String newStatus;

    @Column(name = "review_score")
    private Double reviewScore;

    @Column(name = "reviewer_name")
    private String reviewerName;

    @Column(name = "assigned_reviewer_name")
    private String assignedReviewerName;

    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
