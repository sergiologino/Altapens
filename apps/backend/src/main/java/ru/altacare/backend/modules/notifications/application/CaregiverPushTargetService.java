package ru.altacare.backend.modules.notifications.application;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.altacare.backend.modules.care_network.domain.entity.CareRelationshipEntity;
import ru.altacare.backend.modules.care_network.domain.enums.CareRelationshipStatus;
import ru.altacare.backend.modules.care_network.infrastructure.persistence.CareRelationshipRepository;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

@Service
@RequiredArgsConstructor
public class CaregiverPushTargetService {

    private final CareRelationshipRepository careRelationshipRepository;

    @Transactional(readOnly = true)
    public Set<UUID> activeCaregiverUserIds(SeniorProfileEntity senior) {
        List<CareRelationshipEntity> relationships = careRelationshipRepository.findAllBySeniorProfile(senior);
        Set<UUID> ids = new HashSet<>();
        for (CareRelationshipEntity r : relationships) {
            if (r.getStatus() != CareRelationshipStatus.active) {
                continue;
            }
            ids.add(r.getCaregiverProfile().getUser().getId());
        }
        return ids;
    }
}
