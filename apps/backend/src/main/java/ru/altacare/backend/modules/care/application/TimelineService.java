package ru.altacare.backend.modules.care.application;

import java.time.Instant;
import java.time.LocalDate;
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
import ru.altacare.backend.modules.medications.domain.entity.MedicationIntakeEntity;
import ru.altacare.backend.modules.medications.infrastructure.persistence.MedicationIntakeRepository;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

@Service
@RequiredArgsConstructor
public class TimelineService {

    private final CareSeniorResolver careSeniorResolver;
    private final WellbeingCheckinRepository wellbeingCheckinRepository;
    private final MedicationIntakeRepository medicationIntakeRepository;

    @Transactional(readOnly = true)
    public List<TimelineItemResponse> list(UUID seniorUserIdParam, int limit) {
        SeniorProfileEntity senior = careSeniorResolver.resolve(seniorUserIdParam);
        ZoneId zone = zoneId(senior.getTimezone());
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
                formatTimeLabel(c.getCreatedAt(), zone));
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
                formatTimeLabel(i.getRecordedAt(), zone));
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
