package ru.altacare.backend.modules.care.api.dto;

import java.time.Instant;

public record TimelineItemResponse(
        String id,
        String title,
        String description,
        String level,
        String timeLabel,
        Instant occurredAt) {}
