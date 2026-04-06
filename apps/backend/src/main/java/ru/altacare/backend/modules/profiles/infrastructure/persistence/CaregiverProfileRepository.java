package ru.altacare.backend.modules.profiles.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.profiles.domain.entity.CaregiverProfileEntity;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

public interface CaregiverProfileRepository extends JpaRepository<CaregiverProfileEntity, UUID> {

    Optional<CaregiverProfileEntity> findByUser(UserEntity user);
}
