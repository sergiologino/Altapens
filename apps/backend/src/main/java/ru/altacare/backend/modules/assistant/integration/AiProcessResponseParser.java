package ru.altacare.backend.modules.assistant.integration;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class AiProcessResponseParser {

    private AiProcessResponseParser() {}

    @SuppressWarnings("unchecked")
    public static String extractAssistantText(Map<String, Object> topLevel) {
        if (topLevel == null) {
            return null;
        }
        Object responseObj = topLevel.get("response");
        if (!(responseObj instanceof Map<?, ?> neural)) {
            return null;
        }
        Object choicesObj = neural.get("choices");
        if (!(choicesObj instanceof List<?> choices) || choices.isEmpty()) {
            return null;
        }
        Object first = choices.get(0);
        if (!(first instanceof Map<?, ?> choice)) {
            return null;
        }
        Object msgObj = choice.get("message");
        if (!(msgObj instanceof Map<?, ?> message)) {
            return null;
        }
        Object content = message.get("content");
        return content != null ? content.toString() : null;
    }

    @SuppressWarnings("unchecked")
    public static Optional<String> extractIntegrationTtsBase64(Map<String, Object> topLevel) {
        if (topLevel == null) {
            return Optional.empty();
        }
        Object responseObj = topLevel.get("response");
        if (!(responseObj instanceof Map<?, ?> neural)) {
            return Optional.empty();
        }
        Object ttsObj = neural.get("integration_tts");
        if (!(ttsObj instanceof Map<?, ?> tts)) {
            return Optional.empty();
        }
        Object b64 = tts.get("base64");
        if (b64 == null || b64.toString().isBlank()) {
            return Optional.empty();
        }
        return Optional.of(b64.toString());
    }
}
