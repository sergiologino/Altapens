package ru.altacare.backend.modules.medications.application;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.DateTimeException;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.altacare.backend.common.errors.BadRequestException;
import ru.altacare.backend.common.errors.ForbiddenOperationException;
import ru.altacare.backend.common.errors.NotFoundException;
import ru.altacare.backend.common.security.CurrentUserFacade;
import ru.altacare.backend.modules.care.application.CareSeniorResolver;
import ru.altacare.backend.modules.medications.api.dto.CreateMedicationRequest;
import ru.altacare.backend.modules.medications.api.dto.MedicationDoseResponse;
import ru.altacare.backend.modules.medications.api.dto.MedicationResponse;
import ru.altacare.backend.modules.medications.api.dto.RecordMedicationIntakeRequest;
import ru.altacare.backend.modules.medications.domain.entity.MedicationEntity;
import ru.altacare.backend.modules.medications.domain.entity.MedicationIntakeEntity;
import ru.altacare.backend.modules.medications.domain.enums.MedicationIntakeStatus;
import ru.altacare.backend.modules.medications.infrastructure.persistence.MedicationIntakeRepository;
import ru.altacare.backend.modules.medications.infrastructure.persistence.MedicationRepository;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;
import ru.altacare.backend.modules.users.infrastructure.persistence.UserRepository;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final MedicationIntakeRepository medicationIntakeRepository;
    private final CareSeniorResolver careSeniorResolver;
    private final CurrentUserFacade currentUserFacade;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MedicationResponse> listMedications(UUID seniorUserIdParam) {
        SeniorProfileEntity senior = careSeniorResolver.resolve(seniorUserIdParam);
        return medicationRepository.findBySeniorProfileOrderByCreatedAtDesc(senior).stream()
                .map(this::mapMedication)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicationDoseResponse> listTodayDoses(UUID seniorUserIdParam) {
        SeniorProfileEntity senior = careSeniorResolver.resolve(seniorUserIdParam);
        LocalDate today = todayInSeniorZone(senior);
        Map<String, MedicationIntakeStatus> statusByKey =
                medicationIntakeRepository.findByMedication_SeniorProfileAndOccurrenceDate(senior, today).stream()
                        .collect(Collectors.toMap(
                                i -> i.getMedication().getId() + ":" + i.getSlotIndex(),
                                MedicationIntakeEntity::getStatus,
                                (a, b) -> b));

        ZonedDateTime nowInSeniorZone = ZonedDateTime.now(zoneId(senior.getTimezone()));
        List<MedicationDoseResponse> doses = new ArrayList<>();
        for (MedicationEntity m : medicationRepository.findBySeniorProfileOrderByCreatedAtDesc(senior)) {
            String[] parts = m.getExactTimes().split(",");
            for (int i = 0; i < parts.length; i++) {
                String planned = parts[i].trim();
                if (planned.isEmpty()) {
                    continue;
                }
                String key = m.getId() + ":" + i;
                MedicationIntakeStatus stored = statusByKey.getOrDefault(key, MedicationIntakeStatus.upcoming);
                LocalTime slotTime = MedicationScheduleHelper.parsePlannedTime(planned);
                MedicationIntakeStatus effective =
                        MedicationScheduleHelper.effectiveStatus(stored, today, slotTime, nowInSeniorZone);
                doses.add(new MedicationDoseResponse(
                        key,
                        m.getTitle(),
                        m.getDosageText(),
                        m.getInstructions() == null ? "" : m.getInstructions(),
                        planned,
                        effective.name(),
                        m.isConfirmationRequired()));
            }
        }
        return doses;
    }

    @Transactional
    public void recordIntake(RecordMedicationIntakeRequest request) {
        UserEntity actor = currentUserFacade.requireUser();
        SeniorProfileEntity senior = careSeniorResolver.resolve(request.seniorUserId());
        MedicationEntity medication = medicationRepository
                .findById(request.medicationId())
                .orElseThrow(() -> new NotFoundException("Лекарство не найдено."));
        if (!medication.getSeniorProfile().getId().equals(senior.getId())) {
            throw new ForbiddenOperationException("Лекарство принадлежит другому подопечному.");
        }
        int slotCount = countTimeSlots(medication.getExactTimes());
        if (request.slotIndex() < 0 || request.slotIndex() >= slotCount) {
            throw new BadRequestException("Некорректный номер слота приёма.");
        }
        MedicationIntakeStatus newStatus;
        try {
            newStatus = MedicationIntakeStatus.valueOf(request.status());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Недопустимый статус приёма.");
        }
        if (newStatus == MedicationIntakeStatus.upcoming) {
            throw new BadRequestException("Укажите принятие, пропуск или отложено.");
        }
        LocalDate today = todayInSeniorZone(senior);
        MedicationIntakeEntity entity = medicationIntakeRepository
                .findByMedication_IdAndOccurrenceDateAndSlotIndex(request.medicationId(), today, request.slotIndex())
                .orElseGet(() -> {
                    MedicationIntakeEntity e = new MedicationIntakeEntity();
                    e.setId(UUID.randomUUID());
                    e.setMedication(medication);
                    e.setOccurrenceDate(today);
                    e.setSlotIndex(request.slotIndex());
                    return e;
                });
        entity.setStatus(newStatus);
        entity.setRecordedAt(Instant.now());
        entity.setRecordedBy(userRepository.getReferenceById(actor.getId()));
        medicationIntakeRepository.save(entity);
    }

    @Transactional
    public MedicationResponse create(CreateMedicationRequest request) {
        SeniorProfileEntity senior = careSeniorResolver.resolve(request.seniorUserId());

        MedicationEntity entity = new MedicationEntity();
        entity.setId(UUID.randomUUID());
        entity.setSeniorProfile(senior);
        entity.setTitle(request.title().trim());
        entity.setDosageText(request.dosageText().trim());
        entity.setInstructions(request.instructions().trim());
        entity.setExactTimes(request.exactTimes().trim());
        entity.setDaysOfWeek(request.daysOfWeek().trim());
        entity.setConfirmationRequired(request.confirmationRequired());
        entity.setNotifyOnMissed(request.notifyOnMissed());

        return mapMedication(medicationRepository.save(entity));
    }

    private static int countTimeSlots(String exactTimes) {
        if (exactTimes == null || exactTimes.isBlank()) {
            return 0;
        }
        return (int) Arrays.stream(exactTimes.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .count();
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

    private MedicationResponse mapMedication(MedicationEntity m) {
        return new MedicationResponse(
                m.getId(),
                m.getSeniorProfile().getUser().getId(),
                m.getTitle(),
                m.getDosageText(),
                m.getInstructions(),
                m.getExactTimes(),
                m.getDaysOfWeek(),
                m.isConfirmationRequired(),
                m.isNotifyOnMissed());
    }
}
