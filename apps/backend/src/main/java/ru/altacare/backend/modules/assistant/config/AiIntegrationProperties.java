package ru.altacare.backend.modules.assistant.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.ai-integration")
public class AiIntegrationProperties {

    /**
     * Базовый URL noteapp-ai-integration (без завершающего /).
     */
    private String baseUrl = "http://localhost:8091";

    /**
     * X-API-Key клиентского приложения из таблицы client_applications.
     */
    private String apiKey = "";

    private int connectTimeoutMs = 10_000;
    private int readTimeoutMs = 120_000;

    /**
     * Имя нейросети в интеграции (например openai-gpt4o-mini). Пусто — автовыбор по типу chat.
     */
    private String defaultChatNetwork = "";

    /**
     * Передавать metadata synthesizeTts в интеграцию (нужен отдельный TTS-сервис на стороне интеграции).
     */
    private boolean requestTtsFromIntegration = false;

    public boolean isConfigured() {
        return baseUrl != null && !baseUrl.isBlank() && apiKey != null && !apiKey.isBlank();
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public int getConnectTimeoutMs() {
        return connectTimeoutMs;
    }

    public void setConnectTimeoutMs(int connectTimeoutMs) {
        this.connectTimeoutMs = connectTimeoutMs;
    }

    public int getReadTimeoutMs() {
        return readTimeoutMs;
    }

    public void setReadTimeoutMs(int readTimeoutMs) {
        this.readTimeoutMs = readTimeoutMs;
    }

    public String getDefaultChatNetwork() {
        return defaultChatNetwork;
    }

    public void setDefaultChatNetwork(String defaultChatNetwork) {
        this.defaultChatNetwork = defaultChatNetwork;
    }

    public boolean isRequestTtsFromIntegration() {
        return requestTtsFromIntegration;
    }

    public void setRequestTtsFromIntegration(boolean requestTtsFromIntegration) {
        this.requestTtsFromIntegration = requestTtsFromIntegration;
    }
}
