package ru.altacare.backend.modules.care.application;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.DateTimeException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.altacare.backend.modules.care.api.dto.TimelineItemResponse;
import ru.altacare.backend.modules.checkins.domain.entity.WellbeingCheckinEntity;
import ru.altacare.backend.modules.checkins.infrastructure.persistence.WellbeingCheckinRepository;
import ru.altacare.backend.modules.medications.application.MedicationScheduleHelper;
import ru.altacare.backend.modules.medications.domain.entity.MedicationEntity;
import ru.altacare.backend.modules.medications.domain.entity.MedicationIntakeEntity;
import ru.altacare.backend.modules.medications.domain.enums.MedicationIntakeStatus;
import ru.altacare.backend.modules.medications.infrastructure.persistence.MedicationIntakeRepository;
import ru.altacare.backend.modules.medications.infrastructure.persistence.MedicationRepository;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

@Service
@RequiredArgsConstructor
public class TimelineService {

    private final CareSeniorResolver careSeniorResolver;
    private final WellbeingCheckinRepository wellbeingCheckinRepository;
    private final MedicationIntakeRepository medicationIntakeRepository;
    private final MedicationRepository medicationRepository;

    @Transactional(readOnly = true)
    public List<TimelineItemResponse> list(UUID seniorUserIdParam, int limit) {
        SeniorProfileEntity senior = careSeniorResolver.resolve(seniorUserIdParam);
        ZoneId zone = zoneId(senior.getTimezone());
        LocalDate today = ZonedDateTime.now(zone).toLocalDate();
        Instant dayStart = today.atStartOfDay(zone).toInstant();
        Instant dayEnd = today.plusDays(1).atStartOfDay(zone).toInstant();

        int capped = Math.min(Math.max(limit, 1), 100);
        List<WellbeingCheckinEntity> checkins =
                wellbeingCheckinRepository.findBySeniorProfileOrderByCreatedAtDesc(
                        senior, PageRequest.of(0, 50));
        List<MedicationIntakeEntity> intakes =
                medicationIntakeRepository.findByMedication_SeniorProfileOrderByRecordedAtDesc(
                        senior, PageRequest.of(0, 50));

        record Timed(Instant at, TimelineItemResponse item) {}
        List<Timed> merged = new ArrayList<>();
        for (WellbeingCheckinEntity c : checkins) {
            merged.add(new Timed(c.getCreatedAt(), mapCheckin(c, zone)));
        }
        for (MedicationIntakeEntity i : intakes) {
            merged.add(new Timed(i.getRecordedAt(), mapIntake(i, zone)));
        }

        boolean hasCheckinToday = wellbeingCheckinRepository.existsBySeniorProfileAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                senior, dayStart, dayEnd);
        if (!hasCheckinToday) {
            ZonedDateTime anchor = ZonedDateTime.now(zone).withHour(12).withMinute(0).withSecond(0).withNano(0);
            Instant at = anchor.toInstant();
            merged.add(new Timed(
                    at,
                    new TimelineItemResponse(
                            "wc-missing-" + today,
                            "Самочувствие",
                            "За сегодня нет отметки о самочувствии.",
                            "watch",
                            "Сегодня",
                            at)));
        }

        ZonedDateTime nowZ = ZonedDateTime.now(zone);
        for (MedicationEntity m : medicationRepository.findBySeniorProfileOrderByCreatedAtDesc(senior)) {
            String[] parts = m.getExactTimes().split(",");
            for (int slotIndex = 0; slotIndex < parts.length; slotIndex++) {
                String planned = parts[slotIndex].trim();
                if (planned.isEmpty()) {
                    continue;
                }
                LocalTime slotTime = MedicationScheduleHelper.parsePlannedTime(planned);
                var intakeOpt = medicationIntakeRepository.findByMedication_IdAndOccurrenceDateAndSlotIndex(
                        m.getId(), today, slotIndex);
                MedicationIntakeStatus stored =
                        intakeOpt.map(MedicationIntakeEntity::getStatus).orElse(MedicationIntakeStatus.upcoming);
                MedicationIntakeStatus effective =
                        MedicationScheduleHelper.effectiveStatus(stored, today, slotTime, nowZ);
                if (effective == MedicationIntakeStatus.missed && intakeOpt.isEmpty()) {
                    ZonedDateTime slotStart = today.atTime(slotTime).atZone(zone);
                    Instant at = slotStart.toInstant();
                    merged.add(new Timed(
                            at,
                            new TimelineItemResponse(
                                    "implicit-mi-" + m.getId() + "-" + slotIndex + "-" + today,
                                    "Лекарство: " + m.getTitle(),
                                    "Не подтверждён приём по расписанию (" + planned + ").",
                                    "watch",
                                    formatTimeLabel(at, zone),
                                    at)));
                }
            }
        }

        merged.sort(Comparator.comparing(Timed::at).reversed());
        return merged.stream().limit(capped).map(Timed::item).toList();
    }

    private static TimelineItemResponse mapCheckin(WellbeingCheckinEntity c, ZoneId zone) {
        String level =
                switch (c.getState()) {
                    case good -> "calm";
                    case need_help -> "watch";
                    case bad -> "urgent";
                };
        String desc =
                switch (c.getState()) {
                    case good -> "Мне хорошо.";
                    case need_help -> "Нужна помощь.";
                    case bad -> "Плохо себя чувствую.";
                };
        if (c.getNote() != null && !c.getNote().isBlank()) {
            desc = desc + " " + c.getNote().trim();
        }
        return new TimelineItemResponse(
                "wc-" + c.getId(),
                "Отметка о самочувствии",
                desc.trim(),
                level,
                formatTimeLabel(c.getCreatedAt(), zone),
                c.getCreatedAt());
    }

    private static TimelineItemResponse mapIntake(MedicationIntakeEntity i, ZoneId zone) {
        var med = i.getMedication();
        String desc =
                switch (i.getStatus()) {
                    case taken -> "Отмечено как принято.";
                    case missed -> "Пропуск приёма.";
                    case snoozed -> "Приём отложен.";
                    case upcoming -> "Статус обновлён.";
                };
        String level =
                switch (i.getStatus()) {
                    case taken -> "calm";
                    case missed, snoozed, upcoming -> "watch";
                };
        return new TimelineItemResponse(
                "mi-" + i.getId(),
                "Лекарство: " + med.getTitle(),
                desc,
                level,
                formatTimeLabel(i.getRecordedAt(), zone),
                i.getRecordedAt());
    }

    private static ZoneId zoneId(String timezone) {
        try {
            return ZoneId.of(timezone);
        } catch (DateTimeException e) {
            return ZoneOffset.UTC;
        }
    }

    private static String formatTimeLabel(Instant at, ZoneId zone) {
        ZonedDateTime event = at.atZone(zone);
        ZonedDateTime now = ZonedDateTime.now(zone);
        LocalDate dEvent = event.toLocalDate();
        LocalDate dNow = now.toLocalDate();
        String timePart = event.format(DateTimeFormatter.ofPattern("HH:mm"));
        if (dEvent.equals(dNow)) {
            return "Сегодня, " + timePart;
        }
        if (dEvent.equals(dNow.minusDays(1))) {
            return "Вчера, " + timePart;
        }
        return event.format(DateTimeFormatter.ofPattern("dd.MM.yyyy, HH:mm"));
    }
}
