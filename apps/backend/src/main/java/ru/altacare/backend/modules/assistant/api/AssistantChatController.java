package ru.altacare.backend.modules.assistant.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.altacare.backend.common.api.ApiPaths;
import ru.altacare.backend.modules.assistant.api.dto.AssistantChatRequest;
import ru.altacare.backend.modules.assistant.api.dto.AssistantChatResponse;
import ru.altacare.backend.modules.assistant.application.AssistantAiService;
import ru.altacare.backend.modules.assistant.integration.AssistantIntegrationResult;

@RestController
@RequestMapping(ApiPaths.CARE + "/assistant")
@RequiredArgsConstructor
public class AssistantChatController {

    private final AssistantAiService assistantAiService;

    @PostMapping("/chat")
    public ResponseEntity<AssistantChatResponse> chat(@Valid @RequestBody AssistantChatRequest request) {
        AssistantIntegrationResult result = assistantAiService.chat(request.message(), request.networkName());
        return ResponseEntity.ok(new AssistantChatResponse(
                result.content(),
                result.audioBase64Wav().orElse(null)));
    }
}
