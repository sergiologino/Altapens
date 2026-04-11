package ru.altacare.backend.modules.checkins.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.altacare.backend.modules.checkins.domain.enums.WellbeingState;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "wellbeing_checkins")
public class WellbeingCheckinEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "senior_profile_id", nullable = false)
    private SeniorProfileEntity seniorProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WellbeingState state;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
