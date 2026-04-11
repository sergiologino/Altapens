package ru.altacare.backend.modules.assistant.api.dto;

import jakarta.validation.constraints.NotBlank;

public record AssistantChatRequest(
        @NotBlank(message = "message is required") String message,
        String networkName
) {}
