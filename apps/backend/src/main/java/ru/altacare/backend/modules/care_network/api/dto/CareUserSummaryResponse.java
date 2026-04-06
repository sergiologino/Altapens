package ru.altacare.backend.modules.care_network.api.dto;

import java.util.UUID;
import ru.altacare.backend.modules.care_network.domain.enums.CareRelationshipStatus;

public record CareUserSummaryResponse(
        UUID relationshipId,
        UUID userId,
        String fullName,
        String email,
        CareRelationshipStatus status
) {
}
