package ru.altacare.backend.modules.auth.api.dto;

public record LoginResponse(
        AuthActionResultResponse result,
        AuthUserResponse session,
        String accessToken
) {
}
