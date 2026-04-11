package ru.altacare.backend.modules.assistant.application;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import ru.altacare.backend.common.errors.BadRequestException;
import ru.altacare.backend.common.security.CurrentUserFacade;
import ru.altacare.backend.modules.assistant.config.AiIntegrationProperties;
import ru.altacare.backend.modules.assistant.integration.AiIntegrationClient;
import ru.altacare.backend.modules.assistant.integration.AssistantIntegrationResult;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

@Service
@RequiredArgsConstructor
public class AssistantAiService {

    private final CurrentUserFacade currentUserFacade;
    private final AiIntegrationProperties aiIntegrationProperties;
    private final AiIntegrationClient aiIntegrationClient;

    public AssistantIntegrationResult chat(String message, String networkName) {
        UserEntity user = currentUserFacade.requireUser();
        if (!aiIntegrationProperties.isConfigured()) {
            throw new BadRequestException(
                    "AI integration is not configured. Set AI_INTEGRATION_BASE_URL and AI_INTEGRATION_API_KEY.");
        }
        UUID userId = user.getId();
        try {
            return aiIntegrationClient.processChat(userId, message, networkName);
        } catch (IllegalStateException e) {
            throw new BadRequestException(e.getMessage());
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY, "AI integration unavailable: " + e.getMessage(), e);
        }
    }
}
