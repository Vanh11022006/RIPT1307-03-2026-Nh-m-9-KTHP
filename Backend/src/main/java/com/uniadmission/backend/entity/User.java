package com.uniadmission.backend.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String status;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @JsonIgnore
    @Column(name = "email_verification_token", unique = true)
    private String emailVerificationToken;

    @Column(name = "email_verification_expires")
    private LocalDateTime emailVerificationExpires;

    @JsonIgnore
    @Column(name = "reset_password_token", unique = true)
    private String resetPasswordToken;

    @Column(name = "reset_password_expires")
    private LocalDateTime resetPasswordExpires;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
