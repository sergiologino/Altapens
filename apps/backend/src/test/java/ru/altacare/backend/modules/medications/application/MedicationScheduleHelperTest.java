package ru.altacare.backend.modules.medications.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import org.junit.jupiter.api.Test;
import ru.altacare.backend.modules.medications.domain.enums.MedicationIntakeStatus;

class MedicationScheduleHelperTest {

    @Test
    void overdueUpcomingBecomesMissed() {
        ZoneId moscow = ZoneId.of("Europe/Moscow");
        LocalDate today = LocalDate.of(2026, 4, 6);
        LocalTime nine = LocalTime.of(9, 0);
        ZonedDateTime now = ZonedDateTime.of(today, LocalTime.of(15, 0), moscow);
        assertThat(MedicationScheduleHelper.effectiveStatus(
                        MedicationIntakeStatus.upcoming, today, nine, now))
                .isEqualTo(MedicationIntakeStatus.missed);
    }

    @Test
    void futureSlotStaysUpcoming() {
        ZoneId moscow = ZoneId.of("Europe/Moscow");
        LocalDate today = LocalDate.of(2026, 4, 6);
        LocalTime fourteen = LocalTime.of(14, 0);
        ZonedDateTime now = ZonedDateTime.of(today, LocalTime.of(10, 0), moscow);
        assertThat(MedicationScheduleHelper.effectiveStatus(
                        MedicationIntakeStatus.upcoming, today, fourteen, now))
                .isEqualTo(MedicationIntakeStatus.upcoming);
    }

    @Test
    void parsesFlexibleHourFormat() {
        assertThat(MedicationScheduleHelper.parsePlannedTime("9:00")).isEqualTo(LocalTime.of(9, 0));
        assertThat(MedicationScheduleHelper.parsePlannedTime("09:00")).isEqualTo(LocalTime.of(9, 0));
    }
}
