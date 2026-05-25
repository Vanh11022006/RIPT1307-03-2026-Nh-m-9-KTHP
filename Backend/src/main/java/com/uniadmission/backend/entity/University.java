package com.uniadmission.backend.entity;

import com.uniadmission.backend.entity.enums.EntityStatus;
import javax.persistence.*;
import lombok.*;

@Entity
@Table(name = "universities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class University {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String name;
    private String shortName;
    private String address;
    private String city;
    private String logoUrl;
    private String website;
    private String email;
    private String phone;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private EntityStatus status;
}
