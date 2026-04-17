package ru.altacare.backend.modules.notifications.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterDeviceRequest(
        @NotBlank @Size(max = 16) String platform,
        @NotBlank @Size(max = 4096) String token
) {}
