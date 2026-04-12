package ru.altacare.backend.modules.assistant.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Параметры озвучки для запроса {@code speech_synthesis} в noteapp-ai-integration
 * (модель и голос задаются в БД интеграции; здесь — переопределения в payload).
 */
@ConfigurationProperties(prefix = "app.tts")
public class NeuralTtsProperties {

    private PayloadDefaults defaults = new PayloadDefaults();

    public PayloadDefaults getDefaults() {
        return defaults;
    }

    public void setDefaults(PayloadDefaults defaults) {
        this.defaults = defaults != null ? defaults : new PayloadDefaults();
    }

    /** Совместимость с прежним путём {@code app.tts.openai.*} в yaml. */
    public PayloadDefaults getOpenai() {
        return defaults;
    }

    public void setOpenai(PayloadDefaults openai) {
        this.defaults = openai != null ? openai : new PayloadDefaults();
    }

    public static class PayloadDefaults {
        /**
         * Переопределение модели TTS в payload (если пусто — берётся modelName нейросети в интеграции, напр. tts-1).
         */
        private String model = "";
        /**
         * Голос OpenAI TTS: alloy, echo, fable, onyx, nova, shimmer и т.д.
         */
        private String voice = "nova";

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model != null ? model.trim() : "";
        }

        public String getVoice() {
            return voice;
        }

        public void setVoice(String voice) {
            this.voice = voice != null ? voice.trim() : "";
        }
    }
}
