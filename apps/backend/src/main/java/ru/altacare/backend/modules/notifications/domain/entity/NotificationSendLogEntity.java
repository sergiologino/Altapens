package ru.altacare.backend.modules.notifications.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notification_send_log")
public class NotificationSendLogEntity {

    @Id
    private UUID id;

    @Column(name = "dedupe_key", nullable = false, unique = true, length = 512)
    private String dedupeKey;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
