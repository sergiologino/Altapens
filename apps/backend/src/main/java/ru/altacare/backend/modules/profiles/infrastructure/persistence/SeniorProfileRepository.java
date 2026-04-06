package ru.altacare.backend.modules.profiles.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

public interface SeniorProfileRepository extends JpaRepository<SeniorProfileEntity, UUID> {

    Optional<SeniorProfileEntity> findByUser(UserEntity user);
}
