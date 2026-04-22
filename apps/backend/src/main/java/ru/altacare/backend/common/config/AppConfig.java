package ru.altacare.backend.common.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import ru.altacare.backend.modules.payments.config.YookassaProperties;

@Configuration
@EnableConfigurationProperties({AppSecurityProperties.class, CorsProperties.class, YookassaProperties.class})
public class AppConfig {
}
