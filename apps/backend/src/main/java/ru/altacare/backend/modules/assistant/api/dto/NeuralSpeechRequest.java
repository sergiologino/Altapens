package ru.altacare.backend.modules.assistant.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NeuralSpeechRequest(
        @NotBlank(message = "text is required")
        @Size(max = 4096)
        String text
) {}
