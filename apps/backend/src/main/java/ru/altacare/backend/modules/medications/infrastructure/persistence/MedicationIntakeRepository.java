package ru.altacare.backend.modules.medications.infrastructure.persistence;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.medications.domain.entity.MedicationIntakeEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

public interface MedicationIntakeRepository extends JpaRepository<MedicationIntakeEntity, UUID> {

    List<MedicationIntakeEntity> findByMedication_SeniorProfileAndOccurrenceDate(
            SeniorProfileEntity senior, LocalDate date);

    Optional<MedicationIntakeEntity> findByMedication_IdAndOccurrenceDateAndSlotIndex(
            UUID medicationId, LocalDate date, int slotIndex);

    List<MedicationIntakeEntity> findByMedication_SeniorProfileOrderByRecordedAtDesc(
            SeniorProfileEntity senior, Pageable pageable);
}
