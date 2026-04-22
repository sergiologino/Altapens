package ru.altacare.backend.modules.notifications.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.notifications.domain.entity.NotificationSendLogEntity;

public interface NotificationSendLogRepository extends JpaRepository<NotificationSendLogEntity, UUID> {

    boolean existsByDedupeKey(String dedupeKey);
}
