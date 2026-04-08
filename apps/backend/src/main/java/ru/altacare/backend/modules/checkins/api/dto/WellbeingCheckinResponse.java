package ru.altacare.backend.modules.checkins.api.dto;

import java.time.Instant;
import java.util.UUID;

public record WellbeingCheckinResponse(
        UUID id, UUID seniorUserId, String state, String note, Instant createdAt) {}
