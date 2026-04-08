package ru.altacare.backend.modules.checkins.application;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.altacare.backend.modules.care.application.CareSeniorResolver;
import ru.altacare.backend.modules.checkins.api.dto.RecordWellbeingCheckinRequest;
import ru.altacare.backend.modules.checkins.api.dto.WellbeingCheckinResponse;
import ru.altacare.backend.modules.checkins.domain.entity.WellbeingCheckinEntity;
import ru.altacare.backend.modules.checkins.infrastructure.persistence.WellbeingCheckinRepository;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

@Service
@RequiredArgsConstructor
public class WellbeingCheckinService {

    private final WellbeingCheckinRepository wellbeingCheckinRepository;
    private final CareSeniorResolver careSeniorResolver;

    @Transactional
    public WellbeingCheckinResponse create(RecordWellbeingCheckinRequest request) {
        SeniorProfileEntity senior = careSeniorResolver.resolve(request.seniorUserId());
        WellbeingCheckinEntity entity = new WellbeingCheckinEntity();
        entity.setId(UUID.randomUUID());
        entity.setSeniorProfile(senior);
        entity.setState(request.state());
        String note = request.note();
        if (note != null) {
            note = note.trim();
        }
        entity.setNote(note == null || note.isEmpty() ? null : note);
        entity.setCreatedAt(Instant.now());
        return map(wellbeingCheckinRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<WellbeingCheckinResponse> list(UUID seniorUserIdParam, int limit) {
        SeniorProfileEntity senior = careSeniorResolver.resolve(seniorUserIdParam);
        int capped = Math.min(Math.max(limit, 1), 100);
        return wellbeingCheckinRepository
                .findBySeniorProfileOrderByCreatedAtDesc(senior, PageRequest.of(0, capped))
                .stream()
                .map(this::map)
                .toList();
    }

    private WellbeingCheckinResponse map(WellbeingCheckinEntity e) {
        return new WellbeingCheckinResponse(
                e.getId(),
                e.getSeniorProfile().getUser().getId(),
                e.getState().name(),
                e.getNote(),
                e.getCreatedAt());
    }
}
