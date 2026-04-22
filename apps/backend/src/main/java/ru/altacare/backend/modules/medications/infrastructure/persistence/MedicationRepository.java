package ru.altacare.backend.modules.medications.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.altacare.backend.modules.medications.domain.entity.MedicationEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

public interface MedicationRepository extends JpaRepository<MedicationEntity, UUID> {

    List<MedicationEntity> findBySeniorProfileOrderByCreatedAtDesc(SeniorProfileEntity seniorProfile);

    @Query("select distinct m from MedicationEntity m join fetch m.seniorProfile s join fetch s.user where m.notifyOnMissed = true")
    List<MedicationEntity> findAllNotifyOnMissedFetchingSenior();
}
