package ru.altacare.backend.modules.payments.api.dto;

import java.util.UUID;

public record DonationStatusResponse(
        UUID donationId,
        String status,
        int amountRub,
        boolean demoMode
) {}
