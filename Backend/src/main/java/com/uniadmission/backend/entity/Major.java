package com.uniadmission.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.uniadmission.backend.entity.enums.EntityStatus;
import javax.persistence.*;
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
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private University university;

    @JsonProperty("universityId")
    public Long getUniversityId() {
        return university != null ? university.getId() : null;
    }

    private String code;
    private String name;
    private Double benchmarkScore;

    @Enumerated(EnumType.STRING)
    private EntityStatus status;
}
