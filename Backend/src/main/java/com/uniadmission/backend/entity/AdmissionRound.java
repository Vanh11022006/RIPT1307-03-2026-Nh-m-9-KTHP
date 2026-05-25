package com.uniadmission.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "admission_rounds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionRound {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    private Integer year;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate startDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "upcoming";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @JsonProperty("code")
    public void setCode(String code) {
        this.code = code == null ? null : code.trim().toUpperCase();
    }

    @JsonProperty("status")
    public void setStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            this.status = "upcoming";
            return;
        }

        String normalized = status.trim().toLowerCase();
        if ("ongoing".equals(normalized)) {
            normalized = "active";
        }

        if (!"upcoming".equals(normalized) && !"active".equals(normalized) && !"closed".equals(normalized)) {
            normalized = "upcoming";
        }

        this.status = normalized;
    }
}
