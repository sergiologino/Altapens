package ru.altacare.backend.modules.assistant.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.altacare.backend.common.api.ApiPaths;
import ru.altacare.backend.modules.assistant.api.dto.NeuralSpeechRequest;
import ru.altacare.backend.modules.assistant.api.dto.NeuralSpeechResponse;
import ru.altacare.backend.modules.assistant.application.NeuralTtsService;

@RestController
@RequestMapping(ApiPaths.CARE + "/assistant")
@RequiredArgsConstructor
public class NeuralSpeechController {

    private final NeuralTtsService neuralTtsService;

    /**
     * Нейро-озвучка через noteapp-ai-integration (speech_synthesis, напр. OpenAI TTS на стороне интеграции).
     */
    @PostMapping("/neural-speech")
    public ResponseEntity<NeuralSpeechResponse> neuralSpeech(@Valid @RequestBody NeuralSpeechRequest request) {
        var r = neuralTtsService.synthesize(request.text());
        return ResponseEntity.ok(new NeuralSpeechResponse(r.audioBase64(), r.mimeType()));
    }
}
