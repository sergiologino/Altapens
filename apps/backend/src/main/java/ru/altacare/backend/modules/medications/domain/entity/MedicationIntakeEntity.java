package ru.altacare.backend.modules.medications.domain.entity;

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
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.altacare.backend.modules.medications.domain.enums.MedicationIntakeStatus;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "medication_intakes")
public class MedicationIntakeEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medication_id", nullable = false)
    private MedicationEntity medication;

    @Column(name = "occurrence_date", nullable = false)
    private LocalDate occurrenceDate;

    @Column(name = "slot_index", nullable = false)
    private int slotIndex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MedicationIntakeStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recorded_by_user_id", nullable = false)
    private UserEntity recordedBy;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;
}
