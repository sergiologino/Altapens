package ru.altacare.backend.modules.notifications.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@ConditionalOnProperty(prefix = "app.push.fcm", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class FirebaseMessagingConfiguration {

    private final FcmPushProperties fcmPushProperties;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }
        try (InputStream in = openCredentialsStream()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(in))
                    .build();
            return FirebaseApp.initializeApp(options);
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        return FirebaseMessaging.getInstance(firebaseApp);
    }

    private InputStream openCredentialsStream() throws IOException {
        if (StringUtils.hasText(fcmPushProperties.serviceAccountJsonPath())) {
            Path path = Path.of(fcmPushProperties.serviceAccountJsonPath().trim());
            return Files.newInputStream(path);
        }
        String envPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (StringUtils.hasText(envPath)) {
            return Files.newInputStream(Path.of(envPath.trim()));
        }
        throw new IllegalStateException(
                "FCM включён (app.push.fcm.enabled=true), но не задан путь к ключу: "
                        + "укажите app.push.fcm.service-account-json-path или GOOGLE_APPLICATION_CREDENTIALS.");
    }
}
