package ru.altacare.backend.modules.assistant.integration;

import java.util.Optional;

public record AssistantIntegrationResult(String content, Optional<String> audioBase64Wav) {}
