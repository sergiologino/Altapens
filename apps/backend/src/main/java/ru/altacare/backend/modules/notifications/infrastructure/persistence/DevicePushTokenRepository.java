package ru.altacare.backend.modules.notifications.infrastructure.persistence;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.notifications.domain.entity.DevicePushTokenEntity;

public interface DevicePushTokenRepository extends JpaRepository<DevicePushTokenEntity, UUID> {

    Optional<DevicePushTokenEntity> findByToken(String token);

    List<DevicePushTokenEntity> findByUser_IdInAndPlatformIn(
            Collection<UUID> userIds, Collection<String> platforms);
}
