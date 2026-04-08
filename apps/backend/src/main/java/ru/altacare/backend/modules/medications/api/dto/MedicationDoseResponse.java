package ru.altacare.backend.modules.medications.api.dto;

public record MedicationDoseResponse(
        String id,
        String title,
        String dosageText,
        String plannedTime,
        String status,
        boolean confirmationRequired
) {
}
