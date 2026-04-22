package ru.altacare.backend.modules.notifications.application;

import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.altacare.backend.common.errors.BadRequestException;
import ru.altacare.backend.modules.notifications.api.dto.RegisterDeviceRequest;
import ru.altacare.backend.modules.notifications.domain.entity.DevicePushTokenEntity;
import ru.altacare.backend.modules.notifications.infrastructure.persistence.DevicePushTokenRepository;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

@Service
@RequiredArgsConstructor
public class DevicePushTokenService {

    private static final Set<String> ALLOWED_PLATFORMS = Set.of("android", "ios", "web");

    private final DevicePushTokenRepository devicePushTokenRepository;

    @Transactional
    public void register(UserEntity user, RegisterDeviceRequest request) {
        String platform = request.platform().trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_PLATFORMS.contains(platform)) {
            throw new BadRequestException("Unsupported platform");
        }
        String token = request.token().trim();
        Instant now = Instant.now();

        DevicePushTokenEntity entity = devicePushTokenRepository
                .findByToken(token)
                .orElseGet(() -> {
                    DevicePushTokenEntity created = new DevicePushTokenEntity();
                    created.setId(UUID.randomUUID());
                    created.setCreatedAt(now);
                    return created;
                });

        entity.setUser(user);
        entity.setPlatform(platform);
        entity.setToken(token);
        entity.setUpdatedAt(now);
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(now);
        }

        devicePushTokenRepository.save(entity);
    }
}
