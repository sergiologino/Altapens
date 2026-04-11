package ru.altacare.backend.dev;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

/** Проверяет наличие compose-файла для профиля {@code dev} на classpath. */
class DevComposeFilePresenceTest {

    @Test
    void composeDevPostgresYmlShouldBeOnClasspath() throws Exception {
        try (var in = DevComposeFilePresenceTest.class.getResourceAsStream("/compose-dev-postgres.yml")) {
            assertThat(in)
                    .as("compose-dev-postgres.yml в src/main/resources")
                    .isNotNull();
            String content = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            assertThat(content).contains("postgres:16-alpine");
            assertThat(content).contains("POSTGRES_DB: altacare");
        }
    }
}
