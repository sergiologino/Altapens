package ru.altacare.backend.modules.auth.api.dto;

import java.util.UUID;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;

public record AuthUserResponse(
        UUID id,
        UserRoleName role,
        String fullName,
        String email,
        String phone
) {
}
