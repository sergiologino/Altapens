package ru.altacare.backend.modules.medications.api.dto;

import java.util.UUID;

public record MedicationResponse(
        UUID id,
        UUID seniorUserId,
        String title,
        String dosageText,
        String instructions,
        String exactTimes,
        String daysOfWeek,
        boolean confirmationRequired,
        boolean notifyOnMissed
) {
}
