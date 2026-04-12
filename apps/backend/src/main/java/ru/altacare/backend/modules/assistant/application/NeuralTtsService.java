package ru.altacare.backend.modules.assistant.application;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import ru.altacare.backend.common.errors.BadRequestException;
import ru.altacare.backend.common.security.CurrentUserFacade;
import ru.altacare.backend.modules.assistant.config.AiIntegrationProperties;
import ru.altacare.backend.modules.assistant.config.NeuralTtsProperties;
import ru.altacare.backend.modules.assistant.integration.AiIntegrationClient;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

@Service
@RequiredArgsConstructor
public class NeuralTtsService {

    private static final int MAX_INPUT_CHARS = 4096;

    private final CurrentUserFacade currentUserFacade;
    private final AiIntegrationProperties aiIntegrationProperties;
    private final AiIntegrationClient aiIntegrationClient;
    private final NeuralTtsProperties neuralTtsProperties;

    public NeuralSpeechSynthesisResult synthesize(String text) {
        if (!aiIntegrationProperties.isConfigured()) {
            throw new BadRequestException(
                    "Нейро-озвучка: задайте AI_INTEGRATION_BASE_URL и AI_INTEGRATION_API_KEY (синтез через noteapp-ai-integration).");
        }
        String trimmed = text != null ? text.trim() : "";
        if (trimmed.isEmpty()) {
            throw new BadRequestException("text is required");
        }
        if (trimmed.length() > MAX_INPUT_CHARS) {
            trimmed = trimmed.substring(0, MAX_INPUT_CHARS);
        }

        UserEntity user = currentUserFacade.requireUser();
        NeuralTtsProperties.PayloadDefaults d = neuralTtsProperties.getOpenai();
        String voice = d.getVoice();
        String model = d.getModel();

        try {
            var payload = aiIntegrationClient.synthesizeSpeech(
                    user.getId(),
                    trimmed,
                    null,
                    voice,
                    model.isEmpty() ? null : model);
            return new NeuralSpeechSynthesisResult(payload.audioBase64(), mimeForFormat(payload.format()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(e.getMessage());
        } catch (IllegalStateException e) {
            throw new BadRequestException(e.getMessage());
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY, "AI integration (speech): " + e.getMessage(), e);
        }
    }

    private static String mimeForFormat(String format) {
        if (format == null || format.isBlank()) {
            return "audio/mpeg";
        }
        return switch (format.trim().toLowerCase()) {
            case "mp3" -> "audio/mpeg";
            case "opus" -> "audio/opus";
            case "aac" -> "audio/aac";
            case "wav", "pcm" -> "audio/wav";
            case "flac" -> "audio/flac";
            default -> "application/octet-stream";
        };
    }
}
