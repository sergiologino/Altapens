package ru.altacare.backend.modules.checkins.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import ru.altacare.backend.modules.checkins.domain.enums.WellbeingState;

public record RecordWellbeingCheckinRequest(
        UUID seniorUserId,
        @NotNull WellbeingState state,
        @Size(max = 500) String note) {}
