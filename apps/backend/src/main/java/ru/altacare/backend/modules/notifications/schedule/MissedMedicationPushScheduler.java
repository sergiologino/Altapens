package ru.altacare.backend.modules.notifications.schedule;

import com.google.firebase.messaging.FirebaseMessaging;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ru.altacare.backend.modules.notifications.application.MissedMedicationPushService;

@Component
@ConditionalOnBean(FirebaseMessaging.class)
@RequiredArgsConstructor
@Slf4j
public class MissedMedicationPushScheduler {

    private final MissedMedicationPushService missedMedicationPushService;

    @Scheduled(fixedDelayString = "${app.push.fcm.missed-check-interval-ms:120000}")
    public void tick() {
        try {
            missedMedicationPushService.processMissedMedicationSlots();
        } catch (Exception e) {
            log.error("Missed medication push tick failed", e);
        }
    }
}
