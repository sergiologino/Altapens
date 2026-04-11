package ru.altacare.backend.modules.assistant.config;

import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties(NeuralTtsProperties.class)
public class NeuralTtsConfig {

    @Bean
    public RestTemplate openAiTtsRestTemplate(
            RestTemplateBuilder builder,
            NeuralTtsProperties properties
    ) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(15))
                .setReadTimeout(Duration.ofSeconds(90))
                .build();
    }
}
