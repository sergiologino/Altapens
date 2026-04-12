package ru.altacare.backend.modules.assistant.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(NeuralTtsProperties.class)
public class NeuralTtsConfig {}
