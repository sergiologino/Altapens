package ru.altacare.backend.modules.payments.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateDonationRequest(
        @NotNull @Min(100) @Max(1_000_000) Integer amountRub
) {}
