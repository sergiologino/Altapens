package ru.altacare.backend.modules.notifications.application;

import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.altacare.backend.modules.notifications.domain.entity.NotificationSendLogEntity;
import ru.altacare.backend.modules.notifications.infrastructure.persistence.NotificationSendLogRepository;

@Service
@RequiredArgsConstructor
public class NotificationDedupeService {

    private final NotificationSendLogRepository notificationSendLogRepository;

    @Transactional(readOnly = true)
    public boolean exists(String dedupeKey) {
        return notificationSendLogRepository.existsByDedupeKey(dedupeKey);
    }

    @Transactional
    public void register(String dedupeKey) {
        NotificationSendLogEntity entity = new NotificationSendLogEntity();
        entity.setId(UUID.randomUUID());
        entity.setDedupeKey(dedupeKey);
        entity.setCreatedAt(Instant.now());
        notificationSendLogRepository.save(entity);
    }
}
