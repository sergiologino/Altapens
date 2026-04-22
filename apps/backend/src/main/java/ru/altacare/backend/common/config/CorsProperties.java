package ru.altacare.backend.common.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOriginPatterns) {

    public CorsProperties {
        allowedOriginPatterns =
                (allowedOriginPatterns == null || allowedOriginPatterns.isEmpty())
                        ? List.of(
                                "http://localhost:*",
                                "http://127.0.0.1:*",
                                "https://altapens.ru",
                                "https://www.altapens.ru",
                                "https://app.altapens.ru")
                        : List.copyOf(allowedOriginPatterns);
    }
}
