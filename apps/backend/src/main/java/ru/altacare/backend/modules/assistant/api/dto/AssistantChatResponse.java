package ru.altacare.backend.modules.assistant.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AssistantChatResponse(String content, String audioBase64Wav) {}
