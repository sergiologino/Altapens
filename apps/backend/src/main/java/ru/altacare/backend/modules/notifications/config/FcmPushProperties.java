package ru.altacare.backend.modules.notifications.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.push.fcm")
public record FcmPushProperties(
        boolean enabled,
        /** Интервал между проверками пропущенных приёмов (мс), не меньше 30 с при использовании планировщика. */
        long missedCheckIntervalMs,
        /**
         * Путь к JSON ключу сервисного аккаунта Firebase (файл на диске).
         * Если пусто — используется переменная окружения {@code GOOGLE_APPLICATION_CREDENTIALS}.
         */
        String serviceAccountJsonPath
) {}
