package ru.altacare.backend.modules.care_network.api.dto;

import jakarta.validation.constraints.NotNull;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;

public record CreateInviteRequest(
        @NotNull UserRoleName targetRole,
        String note
) {
}
