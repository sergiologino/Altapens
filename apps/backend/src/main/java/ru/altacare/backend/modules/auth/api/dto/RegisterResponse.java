package ru.altacare.backend.modules.auth.api.dto;

public record RegisterResponse(
        AuthActionResultResponse result,
        AuthUserResponse session,
        String accessToken
) {
}
