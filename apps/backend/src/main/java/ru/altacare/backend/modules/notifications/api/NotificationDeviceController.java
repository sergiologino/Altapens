package ru.altacare.backend.modules.notifications.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.altacare.backend.common.api.ApiPaths;
import ru.altacare.backend.common.security.CurrentUserFacade;
import ru.altacare.backend.modules.notifications.api.dto.RegisterDeviceRequest;
import ru.altacare.backend.modules.notifications.application.DevicePushTokenService;

@RestController
@RequestMapping(ApiPaths.NOTIFICATIONS)
@RequiredArgsConstructor
public class NotificationDeviceController {

    private final CurrentUserFacade currentUserFacade;
    private final DevicePushTokenService devicePushTokenService;

    @PostMapping("/devices")
    public ResponseEntity<Void> registerDevice(@Valid @RequestBody RegisterDeviceRequest request) {
        devicePushTokenService.register(currentUserFacade.requireUser(), request);
        return ResponseEntity.noContent().build();
    }
}
