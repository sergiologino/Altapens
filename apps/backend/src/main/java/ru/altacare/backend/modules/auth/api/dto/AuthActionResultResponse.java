package ru.altacare.backend.modules.auth.api.dto;

public record AuthActionResultResponse(
        boolean ok,
        String message
) {
}
