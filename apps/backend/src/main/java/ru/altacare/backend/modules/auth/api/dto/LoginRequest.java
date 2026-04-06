package ru.altacare.backend.modules.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;

public record LoginRequest(
        @NotNull UserRoleName role,
        @Email @NotBlank String email,
        @NotBlank String password
) {
}
