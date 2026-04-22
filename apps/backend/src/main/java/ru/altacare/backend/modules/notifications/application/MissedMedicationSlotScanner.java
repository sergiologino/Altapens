package ru.altacare.backend.modules.notifications.application;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.altacare.backend.modules.medications.application.MedicationScheduleHelper;
import ru.altacare.backend.modules.medications.domain.entity.MedicationEntity;
import ru.altacare.backend.modules.medications.domain.entity.MedicationIntakeEntity;
import ru.altacare.backend.modules.medications.domain.enums.MedicationIntakeStatus;
import ru.altacare.backend.modules.medications.infrastructure.persistence.MedicationIntakeRepository;
import ru.altacare.backend.modules.medications.infrastructure.persistence.MedicationRepository;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

@Service
@RequiredArgsConstructor
public class MissedMedicationSlotScanner {

    private final MedicationRepository medicationRepository;
    private final MedicationIntakeRepository medicationIntakeRepository;

    public record MissedSlotCandidate(
            String dedupeKey,
            SeniorProfileEntity senior,
            MedicationEntity medication,
            String plannedLabel,
            int slotIndex,
            LocalDate occurrenceDate
    ) {}

    @Transactional(readOnly = true)
    public List<MissedSlotCandidate> findMissedSlotsWithNotifyOnMissed() {
        List<MissedSlotCandidate> out = new ArrayList<>();
        List<MedicationEntity> medications = medicationRepository.findAllNotifyOnMissedFetchingSenior();
        for (MedicationEntity medication : medications) {
            SeniorProfileEntity senior = medication.getSeniorProfile();
            LocalDate today = todayInSeniorZone(senior);
            ZonedDateTime nowInSeniorZone = ZonedDateTime.now(zoneId(senior.getTimezone()));
            Map<String, MedicationIntakeStatus> statusByKey = medicationIntakeRepository
                    .findByMedication_SeniorProfileAndOccurrenceDate(senior, today).stream()
                    .collect(Collectors.toMap(
                            i -> i.getMedication().getId() + ":" + i.getSlotIndex(),
                            MedicationIntakeEntity::getStatus,
                            (a, b) -> b));

            String[] parts = medication.getExactTimes().split(",");
            for (int slotIndex = 0; slotIndex < parts.length; slotIndex++) {
                String planned = parts[slotIndex].trim();
                if (planned.isEmpty()) {
                    continue;
                }
                String key = medication.getId() + ":" + slotIndex;
                MedicationIntakeStatus stored = statusByKey.getOrDefault(key, MedicationIntakeStatus.upcoming);
                LocalTime slotTime = MedicationScheduleHelper.parsePlannedTime(planned);
                MedicationIntakeStatus effective =
                        MedicationScheduleHelper.effectiveStatus(stored, today, slotTime, nowInSeniorZone);
                if (effective != MedicationIntakeStatus.missed) {
                    continue;
                }
                String dedupeKey = "missed_med|%s|%d|%s"
                        .formatted(medication.getId(), slotIndex, today);
                out.add(new MissedSlotCandidate(dedupeKey, senior, medication, planned, slotIndex, today));
            }
        }
        return out;
    }

    private static LocalDate todayInSeniorZone(SeniorProfileEntity senior) {
        try {
            return ZonedDateTime.now(zoneId(senior.getTimezone())).toLocalDate();
        } catch (DateTimeException e) {
            return LocalDate.now(ZoneOffset.UTC);
        }
    }

    private static ZoneId zoneId(String timezone) {
        try {
            return ZoneId.of(timezone);
        } catch (DateTimeException e) {
            return ZoneOffset.UTC;
        }
    }
}
