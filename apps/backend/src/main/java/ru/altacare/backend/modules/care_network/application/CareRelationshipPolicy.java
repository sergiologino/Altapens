package ru.altacare.backend.modules.care_network.application;

import org.springframework.stereotype.Component;
import ru.altacare.backend.common.errors.ForbiddenOperationException;
import ru.altacare.backend.modules.care_network.domain.entity.CareRelationshipEntity;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

@Component
public class CareRelationshipPolicy {

    public void assertUserParticipates(UserEntity user, CareRelationshipEntity relationship) {
        boolean isCaregiver = relationship.getCaregiverProfile().getUser().getId().equals(user.getId());
        boolean isSenior = relationship.getSeniorProfile().getUser().getId().equals(user.getId());
        if (!isCaregiver && !isSenior) {
            throw new ForbiddenOperationException("У вас нет доступа к этой связи заботы.");
        }
    }
}
