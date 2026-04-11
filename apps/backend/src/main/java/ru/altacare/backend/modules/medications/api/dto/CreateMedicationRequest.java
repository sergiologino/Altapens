package ru.altacare.backend.modules.medications.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateMedicationRequest(
        UUID seniorUserId,
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 255) String dosageText,
        @NotBlank @Size(max = 4000) String instructions,
        @NotBlank @Size(max = 500) String exactTimes,
        @NotBlank @Size(max = 120) String daysOfWeek,
        @NotNull Boolean confirmationRequired,
        @NotNull Boolean notifyOnMissed
) {
}
