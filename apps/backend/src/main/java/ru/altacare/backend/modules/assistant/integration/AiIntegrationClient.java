package ru.altacare.backend.modules.assistant.integration;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import ru.altacare.backend.modules.assistant.config.AiIntegrationProperties;

@Component
@RequiredArgsConstructor
public class AiIntegrationClient {

    private final AiIntegrationOwnerBootstrap ownerBootstrap;

    private static final String SYSTEM_PROMPT = """
            Ты дружелюбный помощник для пожилого человека в приложении бытовых подсказок AltaCare. \
            Не выдавай медицинские диагнозы и не назначай лечение; при симптомах советуй обратиться к врачу. \
            Отвечай по-русски кратко и простыми словами.""";

    private final RestTemplate aiIntegrationRestTemplate;
    private final AiIntegrationProperties properties;

    public AssistantIntegrationResult processChat(UUID userId, String userMessage, String networkNameOverride) {
        if (!properties.isConfigured()) {
            throw new IllegalStateException("AI integration is not configured (set AI_INTEGRATION_BASE_URL and AI_INTEGRATION_API_KEY)");
        }
        ownerBootstrap.ensureLinked();

        String base = properties.getBaseUrl().replaceAll("/+$", "");
        String url = base + "/api/ai/process";

        Map<String, Object> payload = new HashMap<>();
        payload.put(
                "messages",
                List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", userMessage)
                ));

        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId.toString());
        body.put("requestType", "chat");
        String net = networkNameOverride != null && !networkNameOverride.isBlank()
                ? networkNameOverride
                : properties.getDefaultChatNetwork();
        if (net != null && !net.isBlank()) {
            body.put("networkName", net);
        }
        body.put("payload", payload);

        if (properties.isRequestTtsFromIntegration()) {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("synthesizeTts", "true");
            metadata.put("ttsVoice", "default");
            body.put("metadata", metadata);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", properties.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = aiIntegrationRestTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> top = response.getBody();
            if (top == null) {
                throw new RestClientException("Empty response from AI integration");
            }
            Object status = top.get("status");
            if ("failed".equals(status)) {
                Object err = top.get("errorMessage");
                throw new RestClientException(err != null ? err.toString() : "AI request failed");
            }
            String text = AiProcessResponseParser.extractAssistantText(top);
            if (text == null || text.isBlank()) {
                throw new RestClientException("No assistant text in AI integration response");
            }
            return new AssistantIntegrationResult(
                    text.trim(), AiProcessResponseParser.extractIntegrationTtsBase64(top));
        } catch (RestClientException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new RestClientException(e.getMessage(), e);
        }
    }

    /**
     * Синтез речи через интеграцию ({@code requestType = speech_synthesis}), в т.ч. OpenAI TTS на стороне интеграции.
     */
    public AiProcessResponseParser.SpeechSynthesisPayload synthesizeSpeech(
            UUID userId, String text, String networkNameOverride, String voice, String modelOverride) {
        if (!properties.isConfigured()) {
            throw new IllegalStateException(
                    "AI integration is not configured (set AI_INTEGRATION_BASE_URL and AI_INTEGRATION_API_KEY)");
        }
        ownerBootstrap.ensureLinked();

        String trimmed = text != null ? text.trim() : "";
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("text is required");
        }

        String base = properties.getBaseUrl().replaceAll("/+$", "");
        String url = base + "/api/ai/process";

        Map<String, Object> payload = new HashMap<>();
        payload.put("input", trimmed);
        payload.put("response_format", "mp3");
        if (voice != null && !voice.isBlank()) {
            payload.put("voice", voice.trim());
        }
        if (modelOverride != null && !modelOverride.isBlank()) {
            payload.put("model", modelOverride.trim());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId.toString());
        body.put("requestType", "speech_synthesis");
        String net = networkNameOverride != null && !networkNameOverride.isBlank()
                ? networkNameOverride
                : properties.getDefaultSpeechSynthesisNetwork();
        if (net != null && !net.isBlank()) {
            body.put("networkName", net);
        }
        body.put("payload", payload);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", properties.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = aiIntegrationRestTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> top = response.getBody();
            if (top == null) {
                throw new RestClientException("Empty response from AI integration");
            }
            Object status = top.get("status");
            if ("failed".equals(status)) {
                Object err = top.get("errorMessage");
                throw new RestClientException(err != null ? err.toString() : "AI speech synthesis failed");
            }
            return AiProcessResponseParser.extractSpeechSynthesis(top)
                    .orElseThrow(() -> new RestClientException("No audio in AI integration speech response"));
        } catch (RestClientException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new RestClientException(e.getMessage(), e);
        }
    }
}
