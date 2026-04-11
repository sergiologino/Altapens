package ru.altacare.backend.modules.medications.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.medications.domain.entity.MedicationEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

public interface MedicationRepository extends JpaRepository<MedicationEntity, UUID> {

    List<MedicationEntity> findBySeniorProfileOrderByCreatedAtDesc(SeniorProfileEntity seniorProfile);
}
