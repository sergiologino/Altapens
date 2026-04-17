package ru.altacare.backend.modules.payments.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.yookassa")
public class YookassaProperties {

    /**
     * Если false — создаётся демо-платёж без вызова API ЮKassa (для локальной разработки и тестов).
     */
    private boolean enabled = false;

    private String shopId = "";

    private String secretKey = "";

    /**
     * Публичный URL веб-приложения для return_url (например https://app.altapens.ru).
     */
    private String publicAppUrl = "http://localhost:5173";
}
