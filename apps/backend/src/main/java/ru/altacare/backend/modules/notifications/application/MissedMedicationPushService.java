package ru.altacare.backend.modules.notifications.application;

import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import ru.altacare.backend.modules.medications.domain.entity.MedicationEntity;
import ru.altacare.backend.modules.notifications.application.MissedMedicationSlotScanner.MissedSlotCandidate;
import ru.altacare.backend.modules.notifications.domain.entity.DevicePushTokenEntity;
import ru.altacare.backend.modules.notifications.infrastructure.persistence.DevicePushTokenRepository;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

@Service
@ConditionalOnBean(FirebaseMessaging.class)
@RequiredArgsConstructor
@Slf4j
public class MissedMedicationPushService {

    private static final List<String> FCM_PLATFORMS = List.of("android", "ios");

    private final FirebaseMessaging firebaseMessaging;
    private final MissedMedicationSlotScanner missedMedicationSlotScanner;
    private final CaregiverPushTargetService caregiverPushTargetService;
    private final DevicePushTokenRepository devicePushTokenRepository;
    private final NotificationDedupeService notificationDedupeService;

    public void processMissedMedicationSlots() {
        List<MissedSlotCandidate> candidates = missedMedicationSlotScanner.findMissedSlotsWithNotifyOnMissed();
        for (MissedSlotCandidate candidate : candidates) {
            if (notificationDedupeService.exists(candidate.dedupeKey())) {
                continue;
            }
            tryDispatch(candidate);
        }
    }

    private void tryDispatch(MissedSlotCandidate candidate) {
        SeniorProfileEntity senior = candidate.senior();
        MedicationEntity medication = candidate.medication();
        Set<UUID> caregiverUserIds = caregiverPushTargetService.activeCaregiverUserIds(senior);
        if (caregiverUserIds.isEmpty()) {
            return;
        }
        List<DevicePushTokenEntity> tokens = devicePushTokenRepository.findByUser_IdInAndPlatformIn(
                caregiverUserIds, FCM_PLATFORMS);
        if (tokens.isEmpty()) {
            return;
        }
        String seniorName = senior.getFirstName().trim() + " " + senior.getLastName().trim();
        String title = "Пропущен приём лекарства";
        String body = seniorName.trim() + ": " + medication.getTitle() + ", время "
                + candidate.plannedLabel().trim();

        Map<String, String> data = new HashMap<>();
        data.put("type", "medication_missed");
        data.put("seniorUserId", senior.getUser().getId().toString());
        data.put("medicationId", medication.getId().toString());
        data.put("slotIndex", String.valueOf(candidate.slotIndex()));
        data.put("occurrenceDate", candidate.occurrenceDate().toString());

        List<String> registrationTokens =
                tokens.stream().map(DevicePushTokenEntity::getToken).distinct().toList();
        List<Message> messages = new ArrayList<>();
        for (String token : registrationTokens) {
            messages.add(Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data)
                    .build());
        }
        try {
            BatchResponse response = firebaseMessaging.sendEach(messages);
            if (response.getFailureCount() > 0) {
                log.warn(
                        "FCM send partial failure: success={}, failure={}",
                        response.getSuccessCount(),
                        response.getFailureCount());
            }
        } catch (FirebaseMessagingException e) {
            log.error("FCM send failed for dedupe={}", candidate.dedupeKey(), e);
            return;
        }

        notificationDedupeService.register(candidate.dedupeKey());
    }
}
