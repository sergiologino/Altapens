package ru.altacare.backend.modules.auth.application;

import ru.altacare.backend.modules.auth.api.dto.AuthActionResultResponse;
import ru.altacare.backend.modules.auth.api.dto.AuthUserResponse;

public record AuthSessionResult(
        AuthActionResultResponse result,
        AuthUserResponse session,
        String accessToken
) {
}
