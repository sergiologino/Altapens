package ru.altacare.backend.modules.medications.application;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import ru.altacare.backend.modules.medications.domain.enums.MedicationIntakeStatus;

/**
 * Слот без записи в БД считается {@code upcoming}; после наступления времени приёма в часовом поясе подопечного
 * отображаем как {@code missed}, пока подопечный не отметил приём/пропуск/отложено.
 */
public final class MedicationScheduleHelper {

    private static final DateTimeFormatter[] TIME_FORMATTERS = {
        DateTimeFormatter.ofPattern("H:mm"),
        DateTimeFormatter.ofPattern("HH:mm"),
    };

    private MedicationScheduleHelper() {}

    public static LocalTime parsePlannedTime(String planned) {
        if (planned == null) {
            throw new IllegalArgumentException("planned time is null");
        }
        String t = planned.trim();
        if (t.isEmpty()) {
            throw new IllegalArgumentException("planned time is blank");
        }
        for (DateTimeFormatter f : TIME_FORMATTERS) {
            try {
                return LocalTime.parse(t, f);
            } catch (DateTimeParseException ignored) {
                // try next
            }
        }
        throw new IllegalArgumentException("Cannot parse planned time: " + planned);
    }

    /**
     * @param stored статус из БД или {@code upcoming}, если записи приёма за сегодня нет
     */
    public static MedicationIntakeStatus effectiveStatus(
            MedicationIntakeStatus stored,
            LocalDate todayInSeniorZone,
            LocalTime slotTime,
            ZonedDateTime nowInSeniorZone) {
        if (stored != MedicationIntakeStatus.upcoming) {
            return stored;
        }
        ZonedDateTime slotStart = todayInSeniorZone.atTime(slotTime).atZone(nowInSeniorZone.getZone());
        if (nowInSeniorZone.isAfter(slotStart)) {
            return MedicationIntakeStatus.missed;
        }
        return MedicationIntakeStatus.upcoming;
    }
}
