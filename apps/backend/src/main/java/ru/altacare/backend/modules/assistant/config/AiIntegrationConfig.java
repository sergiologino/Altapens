package ru.altacare.backend.modules.assistant.config;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties(AiIntegrationProperties.class)
public class AiIntegrationConfig {

    @Bean
    public RestTemplate aiIntegrationRestTemplate(
            RestTemplateBuilder builder,
            AiIntegrationProperties properties
    ) {
        return builder
                .connectTimeout(Duration.ofMillis(properties.getConnectTimeoutMs()))
                .readTimeout(Duration.ofMillis(properties.getReadTimeoutMs()))
                .build();
    }
}
