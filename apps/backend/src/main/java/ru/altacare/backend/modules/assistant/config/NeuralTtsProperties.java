package ru.altacare.backend.modules.assistant.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Нейро-озвучка через OpenAI Audio API ({@code /v1/audio/speech}) — естественнее, чем Web Speech в браузере.
 */
@ConfigurationProperties(prefix = "app.tts")
public class NeuralTtsProperties {

    private OpenAi openai = new OpenAi();

    public boolean isNeuralEnabled() {
        String k = openai.getApiKey();
        return k != null && !k.isBlank();
    }

    public OpenAi getOpenai() {
        return openai;
    }

    public void setOpenai(OpenAi openai) {
        this.openai = openai != null ? openai : new OpenAi();
    }

    public static class OpenAi {
        /** API key OpenAI (только сервер; не класть во фронт). */
        private String apiKey = "";
        /** Необязательно: идентификатор организации OpenAI (заголовок OpenAI-Organization). */
        private String organizationId = "";
        /** {@code tts-1} быстрее, {@code tts-1-hd} качественнее. */
        private String model = "tts-1-hd";
        /**
         * Голос: alloy, echo, fable, onyx, nova, shimmer — мультиязычные, для русского обычно хороши nova/shimmer.
         */
        private String voice = "nova";

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey != null ? apiKey.trim() : "";
        }

        public String getOrganizationId() {
            return organizationId;
        }

        public void setOrganizationId(String organizationId) {
            this.organizationId = organizationId != null ? organizationId.trim() : "";
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public String getVoice() {
            return voice;
        }

        public void setVoice(String voice) {
            this.voice = voice;
        }
    }
}
