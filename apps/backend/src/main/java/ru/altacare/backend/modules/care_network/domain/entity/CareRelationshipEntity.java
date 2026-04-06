package ru.altacare.backend.modules.care_network.domain.entity;

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
import ru.altacare.backend.common.persistence.AuditableEntity;
import ru.altacare.backend.modules.care_network.domain.enums.CareRelationshipStatus;
import ru.altacare.backend.modules.profiles.domain.entity.CaregiverProfileEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "care_relationships")
public class CareRelationshipEntity extends AuditableEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "senior_id", nullable = false)
    private SeniorProfileEntity seniorProfile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "caregiver_id", nullable = false)
    private CaregiverProfileEntity caregiverProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CareRelationshipStatus status;

    @Column(name = "invited_at", nullable = false)
    private Instant invitedAt;

    @Column(name = "accepted_at", nullable = false)
    private Instant acceptedAt;
}
