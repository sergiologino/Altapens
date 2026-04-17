package ru.altacare.backend.modules.payments.api.dto;

import java.util.UUID;

public record CreateDonationResponse(UUID donationId, String confirmationUrl, boolean demoMode) {}
