package ru.altacare.backend.modules.medications.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RecordMedicationIntakeRequest(
        UUID seniorUserId,
        @NotNull UUID medicationId,
        @NotNull Integer slotIndex,
        @NotNull String status) {}
