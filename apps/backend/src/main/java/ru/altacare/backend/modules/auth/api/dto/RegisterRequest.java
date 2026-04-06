package ru.altacare.backend.modules.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;

public record RegisterRequest(
        @NotNull UserRoleName role,
        @NotBlank @Size(min = 3, max = 120) String fullName,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 30) String phone,
        @NotBlank @Size(min = 4, max = 120) String password,
        String inviteCode
) {
}
