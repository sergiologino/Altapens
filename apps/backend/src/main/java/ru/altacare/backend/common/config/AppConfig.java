package ru.altacare.backend.common.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({AppSecurityProperties.class, CorsProperties.class})
public class AppConfig {
}
