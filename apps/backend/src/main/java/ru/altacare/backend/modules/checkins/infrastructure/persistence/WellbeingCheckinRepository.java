package ru.altacare.backend.modules.checkins.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.checkins.domain.entity.WellbeingCheckinEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

public interface WellbeingCheckinRepository extends JpaRepository<WellbeingCheckinEntity, UUID> {

    List<WellbeingCheckinEntity> findBySeniorProfileOrderByCreatedAtDesc(
            SeniorProfileEntity senior, Pageable pageable);

    boolean existsBySeniorProfileAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            SeniorProfileEntity senior, Instant startInclusive, Instant endExclusive);
}
