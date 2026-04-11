package ru.altacare.backend.modules.care.application;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.altacare.backend.common.errors.BadRequestException;
import ru.altacare.backend.common.errors.ForbiddenOperationException;
import ru.altacare.backend.common.errors.NotFoundException;
import ru.altacare.backend.common.security.CurrentUserFacade;
import ru.altacare.backend.modules.care_network.infrastructure.persistence.CareRelationshipRepository;
import ru.altacare.backend.modules.profiles.domain.entity.CaregiverProfileEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;
import ru.altacare.backend.modules.profiles.infrastructure.persistence.CaregiverProfileRepository;
import ru.altacare.backend.modules.profiles.infrastructure.persistence.SeniorProfileRepository;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;

@Service
@RequiredArgsConstructor
public class CareSeniorResolver {

    private final SeniorProfileRepository seniorProfileRepository;
    private final CaregiverProfileRepository caregiverProfileRepository;
    private final CareRelationshipRepository careRelationshipRepository;
    private final CurrentUserFacade currentUserFacade;

    public SeniorProfileEntity resolve(UUID seniorUserIdParam) {
        UserEntity user = currentUserFacade.requireUser();
        boolean isCaregiver = hasRole(user, UserRoleName.caregiver);
        boolean seniorRole = hasRole(user, UserRoleName.senior);

        if (seniorRole) {
            if (seniorUserIdParam != null && !seniorUserIdParam.equals(user.getId())) {
                throw new BadRequestException("Можно работать только со своим профилем.");
            }
            return seniorProfileRepository
                    .findByUser(user)
                    .orElseThrow(() -> new NotFoundException("Профиль подопечного не найден."));
        }

        if (isCaregiver) {
            if (seniorUserIdParam == null) {
                throw new BadRequestException("Укажите подопечного: параметр seniorUserId.");
            }
            SeniorProfileEntity senior = seniorProfileRepository
                    .findByUser_Id(seniorUserIdParam)
                    .orElseThrow(() -> new NotFoundException("Подопечный не найден."));
            CaregiverProfileEntity caregiverProfile = caregiverProfileRepository
                    .findByUser(user)
                    .orElseThrow(() -> new NotFoundException("Профиль опекуна не найден."));
            if (!careRelationshipRepository.existsByCaregiverProfileAndSeniorProfile(caregiverProfile, senior)) {
                throw new ForbiddenOperationException("Нет связи заботы с этим подопечным.");
            }
            return senior;
        }

        throw new ForbiddenOperationException("Недостаточно прав.");
    }

    private static boolean hasRole(UserEntity user, UserRoleName role) {
        return user.getRoles().stream().anyMatch(r -> r.getRoleName() == role);
    }
}
