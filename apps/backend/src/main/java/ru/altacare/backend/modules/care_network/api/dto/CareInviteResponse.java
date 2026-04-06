package ru.altacare.backend.modules.care_network.api.dto;

import java.time.Instant;
import java.util.UUID;
import ru.altacare.backend.modules.care_network.domain.enums.CareInviteStatus;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;

public record CareInviteResponse(
        UUID id,
        String code,
        UUID createdByUserId,
        String createdByName,
        UserRoleName targetRole,
        CareInviteStatus status,
        Instant expiresAt,
        String note,
        UUID acceptedByUserId
) {
}
