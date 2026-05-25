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

    @JsonProperty("universityId")
    public void setUniversityId(Long universityId) {
        if (universityId == null) {
            this.university = null;
            return;
        }

        if (this.university == null) {
            this.university = new University();
        }
        this.university.setId(universityId);
    }

    private String code;
    private String name;
    private Integer admissionQuota;

    @ElementCollection
    @CollectionTable(name = "major_subject_group_codes", joinColumns = @JoinColumn(name = "major_id"))
    @Column(name = "subject_group_code")
    private java.util.List<String> subjectGroupCodes;

    private Double minScore;
    private Double tuitionFeePerYear;

    @Column(length = 2000)
    private String description;

    private Double benchmarkScore;

    @Enumerated(EnumType.STRING)
    private EntityStatus status;
}
