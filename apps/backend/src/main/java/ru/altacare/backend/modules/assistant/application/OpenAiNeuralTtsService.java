package ru.altacare.backend.modules.assistant.application;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import ru.altacare.backend.common.errors.BadRequestException;
import ru.altacare.backend.modules.assistant.config.NeuralTtsProperties;

@Service
public class OpenAiNeuralTtsService {

    private static final int MAX_INPUT_CHARS = 4096;

    private final RestTemplate openAiTtsRestTemplate;
    private final NeuralTtsProperties ttsProperties;

    public OpenAiNeuralTtsService(
            @Qualifier("openAiTtsRestTemplate") RestTemplate openAiTtsRestTemplate,
            NeuralTtsProperties ttsProperties
    ) {
        this.openAiTtsRestTemplate = openAiTtsRestTemplate;
        this.ttsProperties = ttsProperties;
    }

    /**
     * @return MP3 bytes
     */
    public byte[] synthesizeMp3(String text) {
        if (!ttsProperties.isNeuralEnabled()) {
            throw new BadRequestException(
                    "Neural TTS is not configured. Set OPENAI_TTS_API_KEY (or app.tts.openai.api-key).");
        }
        String trimmed = text != null ? text.trim() : "";
        if (trimmed.isEmpty()) {
            throw new BadRequestException("text is required");
        }
        if (trimmed.length() > MAX_INPUT_CHARS) {
            trimmed = trimmed.substring(0, MAX_INPUT_CHARS);
        }

        NeuralTtsProperties.OpenAi o = ttsProperties.getOpenai();
        Map<String, Object> body = new HashMap<>();
        body.put("model", o.getModel());
        body.put("voice", o.getVoice());
        body.put("input", trimmed);
        body.put("response_format", "mp3");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(o.getApiKey());
        headers.setAccept(java.util.List.of(MediaType.parseMediaType("audio/mpeg")));
        if (o.getOrganizationId() != null && !o.getOrganizationId().isBlank()) {
            headers.set("OpenAI-Organization", o.getOrganizationId());
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<byte[]> response = openAiTtsRestTemplate.exchange(
                    "https://api.openai.com/v1/audio/speech",
                    HttpMethod.POST,
                    entity,
                    byte[].class);
            byte[] audio = response.getBody();
            if (audio == null || audio.length == 0) {
                throw new RestClientException("Empty audio from OpenAI TTS");
            }
            return audio;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            String detail = safeBody(e.getResponseBodyAsString(StandardCharsets.UTF_8));
            String msg = "OpenAI TTS HTTP " + e.getStatusCode().value();
            if (!detail.isEmpty()) {
                msg += ": " + detail;
            } else {
                msg += ": " + e.getMessage();
            }
            throw new RestClientException(msg, e);
        } catch (ResourceAccessException e) {
            throw new RestClientException(
                    "OpenAI TTS network error (check internet / firewall / proxy): " + e.getMessage(), e);
        } catch (RestClientException e) {
            throw new RestClientException("OpenAI TTS failed: " + e.getMessage(), e);
        }
    }

    /**
     * Обрезает длинное тело, чтобы не раздувать ответ API.
     */
    private static String safeBody(String raw) {
        if (raw == null) {
            return "";
        }
        String t = raw.trim();
        if (t.length() > 2000) {
            return t.substring(0, 2000) + "…";
        }
        return t;
    }

    public String synthesizeMp3Base64(String text) {
        return Base64.getEncoder().encodeToString(synthesizeMp3(text));
    }
}
