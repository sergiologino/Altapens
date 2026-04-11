package ru.altacare.backend.modules.assistant.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.client.RestClientException;
import ru.altacare.backend.common.api.ApiPaths;
import ru.altacare.backend.modules.assistant.api.dto.NeuralSpeechRequest;
import ru.altacare.backend.modules.assistant.api.dto.NeuralSpeechResponse;
import ru.altacare.backend.modules.assistant.application.OpenAiNeuralTtsService;

@RestController
@RequestMapping(ApiPaths.CARE + "/assistant")
@RequiredArgsConstructor
public class NeuralSpeechController {

    private final OpenAiNeuralTtsService openAiNeuralTtsService;

    /**
     * Нейро-озвучка текста (MP3, OpenAI). Для естественной русской речи без «робота» из Web Speech API.
     */
    @PostMapping("/neural-speech")
    public ResponseEntity<NeuralSpeechResponse> neuralSpeech(@Valid @RequestBody NeuralSpeechRequest request) {
        try {
            String b64 = openAiNeuralTtsService.synthesizeMp3Base64(request.text());
            return ResponseEntity.ok(new NeuralSpeechResponse(b64, "audio/mpeg"));
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, e.getMessage(), e);
        }
    }
}
