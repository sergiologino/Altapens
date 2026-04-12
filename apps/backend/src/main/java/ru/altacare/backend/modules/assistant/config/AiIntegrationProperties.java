package ru.altacare.backend.modules.assistant.config;

import java.util.Locale;
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
     * Имя нейросети для синтеза речи (тип {@code speech_synthesis}), например {@code openai-tts}.
     * Пусто — автовыбор среди доступных клиенту сетей с типом speech_synthesis.
     */
    private String defaultSpeechSynthesisNetwork = "";

    /**
     * Передавать metadata synthesizeTts в интеграцию (нужен отдельный TTS-сервис на стороне интеграции).
     */
    private boolean requestTtsFromIntegration = false;

    /**
     * Логин админа в интеграции для POST /api/auth/login (как у других приложений: потом привязка клиента к пользователю).
     */
    private String adminUsername = "admin";

    /**
     * Пароль админа интеграции. Если задан — при старте запросов к AI выполняется привязка клиента по API-ключу к {@link #ownerEmail}.
     */
    private String adminPassword = "";

    /**
     * Email пользователя в {@code user_accounts} интеграции (тот же, что у admin в admin_users), для POST .../assign-user.
     */
    private String ownerEmail = "admin@example.com";

    public boolean isConfigured() {
        return baseUrl != null && !baseUrl.isBlank() && apiKey != null && !apiKey.isBlank();
    }

    /** Автопривязка клиента к владельцу через админское API интеграции. */
    public boolean isOwnerBootstrapEnabled() {
        return isConfigured() && adminPassword != null && !adminPassword.isBlank();
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = normalizeBaseUrl(baseUrl);
    }

    /**
     * Без схемы RestTemplate падает с «URI with undefined scheme». Как у других клиентов интеграции: голый хост вроде
     * {@code sergiologino-...twc1.net} → {@code https://...}; {@code localhost} / {@code 127.0.0.1} → {@code http://}.
     */
    private static String normalizeBaseUrl(String raw) {
        if (raw == null) {
            return "http://localhost:8091";
        }
        String t = raw.trim();
        if (t.isEmpty()) {
            return "http://localhost:8091";
        }
        if (t.contains("://")) {
            return t;
        }
        String lower = t.toLowerCase(Locale.ROOT);
        if (lower.startsWith("localhost") || lower.startsWith("127.0.0.1")) {
            return "http://" + t;
        }
        return "https://" + t;
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

    public String getDefaultSpeechSynthesisNetwork() {
        return defaultSpeechSynthesisNetwork;
    }

    public void setDefaultSpeechSynthesisNetwork(String defaultSpeechSynthesisNetwork) {
        this.defaultSpeechSynthesisNetwork = defaultSpeechSynthesisNetwork;
    }

    public boolean isRequestTtsFromIntegration() {
        return requestTtsFromIntegration;
    }

    public void setRequestTtsFromIntegration(boolean requestTtsFromIntegration) {
        this.requestTtsFromIntegration = requestTtsFromIntegration;
    }

    public String getAdminUsername() {
        return adminUsername;
    }

    public void setAdminUsername(String adminUsername) {
        this.adminUsername = adminUsername != null ? adminUsername : "admin";
    }

    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword != null ? adminPassword : "";
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail != null && !ownerEmail.isBlank() ? ownerEmail.trim() : "admin@example.com";
    }
}
