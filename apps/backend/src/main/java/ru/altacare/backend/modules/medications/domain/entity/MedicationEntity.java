package ru.altacare.backend.modules.medications.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.altacare.backend.common.persistence.AuditableEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "medications")
public class MedicationEntity extends AuditableEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "senior_profile_id", nullable = false)
    private SeniorProfileEntity seniorProfile;

    @Column(nullable = false)
    private String title;

    @Column(name = "dosage_text", nullable = false)
    private String dosageText;

    @Column(nullable = false)
    private String instructions;

    @Column(name = "exact_times", nullable = false)
    private String exactTimes;

    @Column(name = "days_of_week", nullable = false)
    private String daysOfWeek;

    @Column(name = "confirmation_required", nullable = false)
    private boolean confirmationRequired;

    @Column(name = "notify_on_missed", nullable = false)
    private boolean notifyOnMissed;
}
