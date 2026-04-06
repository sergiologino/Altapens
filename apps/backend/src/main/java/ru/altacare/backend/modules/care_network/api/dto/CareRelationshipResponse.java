package ru.altacare.backend.modules.care_network.api.dto;

import java.util.UUID;
import ru.altacare.backend.modules.care_network.domain.enums.CareRelationshipStatus;

public record CareRelationshipResponse(
        UUID id,
        UUID seniorUserId,
        UUID caregiverUserId,
        CareRelationshipStatus status
) {
}
