package ru.altacare.backend.modules.care_network.application;

import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;
import ru.altacare.backend.common.errors.BadRequestException;
import ru.altacare.backend.common.errors.ForbiddenOperationException;
import ru.altacare.backend.common.errors.NotFoundException;
import ru.altacare.backend.common.security.CurrentUserFacade;
import ru.altacare.backend.modules.auth.api.dto.AuthActionResultResponse;
import ru.altacare.backend.modules.care_network.api.dto.CareInviteResponse;
import ru.altacare.backend.modules.care_network.api.dto.CareRelationshipResponse;
import ru.altacare.backend.modules.care_network.api.dto.CareUserSummaryResponse;
import ru.altacare.backend.modules.care_network.api.dto.CreateInviteRequest;
import ru.altacare.backend.modules.care_network.domain.entity.CareInviteEntity;
import ru.altacare.backend.modules.care_network.domain.entity.CareRelationshipEntity;
import ru.altacare.backend.modules.care_network.domain.enums.CareInviteStatus;
import ru.altacare.backend.modules.care_network.domain.enums.CareRelationshipStatus;
import ru.altacare.backend.modules.care_network.infrastructure.persistence.CareInviteRepository;
import ru.altacare.backend.modules.care_network.infrastructure.persistence.CareRelationshipRepository;
import ru.altacare.backend.modules.profiles.domain.entity.CaregiverProfileEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;
import ru.altacare.backend.modules.profiles.infrastructure.persistence.CaregiverProfileRepository;
import ru.altacare.backend.modules.profiles.infrastructure.persistence.SeniorProfileRepository;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;

@Service
@RequiredArgsConstructor
public class CareNetworkService {

    private final CareInviteRepository careInviteRepository;
    private final CareRelationshipRepository careRelationshipRepository;
    private final SeniorProfileRepository seniorProfileRepository;
    private final CaregiverProfileRepository caregiverProfileRepository;
    private final CurrentUserFacade currentUserFacade;
    private final CareRelationshipPolicy careRelationshipPolicy;

    @Transactional
    public CareInviteResponse createInvite(CreateInviteRequest request) {
        UserEntity currentUser = currentUserFacade.requireUser();
        assertHasRole(currentUser, UserRoleName.caregiver);

        CareInviteEntity invite = new CareInviteEntity();
        invite.setId(UUID.randomUUID());
        invite.setCode(generateCode());
        invite.setCreatedByUser(currentUser);
        invite.setTargetRole(request.targetRole());
        invite.setStatus(CareInviteStatus.active);
        invite.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
        invite.setNote(request.note());

        return mapInvite(careInviteRepository.save(invite));
    }

    public CareInviteResponse lookupInvite(String code) {
        return careInviteRepository.findByCodeIgnoreCase(normalizeCode(code))
                .map(this::mapInvite)
                .orElse(null);
    }

    @Transactional
    public AuthActionResultResponse acceptInvite(String code) {
        UserEntity currentUser = currentUserFacade.requireUser();
        return acceptInviteForUser(currentUser, code);
    }

    @Transactional
    public AuthActionResultResponse acceptInviteForUser(UserEntity currentUser, String code) {
        CareInviteEntity invite = careInviteRepository.findByCodeIgnoreCase(normalizeCode(code))
                .orElseThrow(() -> new BadRequestException("Приглашение не найдено."));

        if (invite.getStatus() == CareInviteStatus.accepted) {
            throw new BadRequestException("Это приглашение уже использовано.");
        }
        if (invite.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Срок действия приглашения истёк.");
        }
        assertHasRole(currentUser, invite.getTargetRole());

        CaregiverProfileEntity caregiverProfile;
        SeniorProfileEntity seniorProfile;
        if (invite.getTargetRole() == UserRoleName.senior) {
            caregiverProfile = caregiverProfileRepository.findByUser(invite.getCreatedByUser())
                    .orElseThrow(() -> new BadRequestException("Не найден caregiver профиль создателя приглашения."));
            seniorProfile = seniorProfileRepository.findByUser(currentUser)
                    .orElseThrow(() -> new BadRequestException("Не найден senior профиль пользователя."));
        } else {
            caregiverProfile = caregiverProfileRepository.findByUser(currentUser)
                    .orElseThrow(() -> new BadRequestException("Не найден caregiver профиль пользователя."));
            seniorProfile = seniorProfileRepository.findByUser(invite.getCreatedByUser())
                    .orElseThrow(() -> new BadRequestException("Не найден senior профиль создателя приглашения."));
        }

        if (!careRelationshipRepository.existsByCaregiverProfileAndSeniorProfile(caregiverProfile, seniorProfile)) {
            CareRelationshipEntity relationship = new CareRelationshipEntity();
            relationship.setId(UUID.randomUUID());
            relationship.setCaregiverProfile(caregiverProfile);
            relationship.setSeniorProfile(seniorProfile);
            relationship.setStatus(CareRelationshipStatus.active);
            relationship.setInvitedAt(invite.getCreatedAt());
            relationship.setAcceptedAt(Instant.now());
            careRelationshipRepository.save(relationship);
        }

        invite.setStatus(CareInviteStatus.accepted);
        invite.setAcceptedByUser(currentUser);
        careInviteRepository.save(invite);

        return new AuthActionResultResponse(true, "Связка заботы создана.");
    }

    public List<CareUserSummaryResponse> getSeniors() {
        UserEntity currentUser = currentUserFacade.requireUser();
        assertHasRole(currentUser, UserRoleName.caregiver);
        CaregiverProfileEntity caregiverProfile = caregiverProfileRepository.findByUser(currentUser)
                .orElseThrow(() -> new NotFoundException("Профиль caregiver не найден."));

        return careRelationshipRepository.findAllByCaregiverProfile(caregiverProfile).stream()
                .map(relationship -> new CareUserSummaryResponse(
                        relationship.getId(),
                        relationship.getSeniorProfile().getUser().getId(),
                        relationship.getSeniorProfile().getFirstName() + " " + relationship.getSeniorProfile().getLastName(),
                        relationship.getSeniorProfile().getUser().getEmail(),
                        relationship.getStatus()
                ))
                .toList();
    }

    public List<CareUserSummaryResponse> getCaregivers() {
        UserEntity currentUser = currentUserFacade.requireUser();
        assertHasRole(currentUser, UserRoleName.senior);
        SeniorProfileEntity seniorProfile = seniorProfileRepository.findByUser(currentUser)
                .orElseThrow(() -> new NotFoundException("Профиль senior не найден."));

        return careRelationshipRepository.findAllBySeniorProfile(seniorProfile).stream()
                .map(relationship -> new CareUserSummaryResponse(
                        relationship.getId(),
                        relationship.getCaregiverProfile().getUser().getId(),
                        relationship.getCaregiverProfile().getDisplayName(),
                        relationship.getCaregiverProfile().getUser().getEmail(),
                        relationship.getStatus()
                ))
                .toList();
    }

    public CareRelationshipResponse getRelationship(UUID relationshipId) {
        UserEntity currentUser = currentUserFacade.requireUser();
        CareRelationshipEntity relationship = careRelationshipRepository.findDetailedById(relationshipId)
                .orElseThrow(() -> new NotFoundException("Связь заботы не найдена."));

        careRelationshipPolicy.assertUserParticipates(currentUser, relationship);
        return new CareRelationshipResponse(
                relationship.getId(),
                relationship.getSeniorProfile().getUser().getId(),
                relationship.getCaregiverProfile().getUser().getId(),
                relationship.getStatus()
        );
    }

    public List<CareInviteResponse> getInvitesCreatedByCurrentUser() {
        UserEntity currentUser = currentUserFacade.requireUser();
        return careInviteRepository.findAllByCreatedByUserOrderByCreatedAtDesc(currentUser).stream()
                .map(this::mapInvite)
                .toList();
    }

    private void assertHasRole(UserEntity user, UserRoleName requiredRole) {
        boolean hasRole = user.getRoles().stream().anyMatch(role -> role.getRoleName() == requiredRole);
        if (!hasRole) {
            throw new ForbiddenOperationException("Недостаточно прав для этой операции.");
        }
    }

    private CareInviteResponse mapInvite(CareInviteEntity invite) {
        return new CareInviteResponse(
                invite.getId(),
                invite.getCode(),
                invite.getCreatedByUser().getId(),
                resolveCreatorName(invite.getCreatedByUser()),
                invite.getTargetRole(),
                invite.getStatus(),
                invite.getExpiresAt(),
                invite.getNote(),
                invite.getAcceptedByUser() != null ? invite.getAcceptedByUser().getId() : null
        );
    }

    private String resolveCreatorName(UserEntity user) {
        return caregiverProfileRepository.findByUser(user)
                .map(CaregiverProfileEntity::getDisplayName)
                .orElseGet(() -> seniorProfileRepository.findByUser(user)
                        .map(profile -> profile.getFirstName() + " " + profile.getLastName())
                        .orElse(user.getEmail()));
    }

    private String generateCode() {
        return "ALTA-" + RandomStringUtils.secure().nextAlphanumeric(4).toUpperCase(Locale.ROOT);
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }
}
