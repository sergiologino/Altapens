package ru.altacare.backend.modules.auth.application;

import jakarta.transaction.Transactional;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.altacare.backend.common.errors.BadRequestException;
import ru.altacare.backend.common.errors.UnauthorizedException;
import ru.altacare.backend.common.security.CurrentUserFacade;
import ru.altacare.backend.common.security.JwtService;
import ru.altacare.backend.modules.auth.api.dto.AuthActionResultResponse;
import ru.altacare.backend.modules.auth.api.dto.AuthUserResponse;
import ru.altacare.backend.modules.auth.api.dto.LoginRequest;
import ru.altacare.backend.modules.auth.api.dto.RegisterRequest;
import ru.altacare.backend.modules.care_network.application.CareNetworkService;
import ru.altacare.backend.modules.profiles.domain.entity.CaregiverProfileEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;
import ru.altacare.backend.modules.profiles.infrastructure.persistence.CaregiverProfileRepository;
import ru.altacare.backend.modules.profiles.infrastructure.persistence.SeniorProfileRepository;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;
import ru.altacare.backend.modules.users.domain.entity.UserRoleEntity;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;
import ru.altacare.backend.modules.users.domain.enums.UserStatus;
import ru.altacare.backend.modules.users.infrastructure.persistence.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final SeniorProfileRepository seniorProfileRepository;
    private final CaregiverProfileRepository caregiverProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CareNetworkService careNetworkService;
    private final CurrentUserFacade currentUserFacade;

    @Transactional
    public AuthSessionResult register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new BadRequestException("Пользователь с таким email уже существует.");
        }

        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail(normalizedEmail);
        user.setPhone(request.phone().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setStatus(UserStatus.active);

        UserRoleEntity role = new UserRoleEntity();
        role.setId(UUID.randomUUID());
        role.setRoleName(request.role());
        user.addRole(role);

        UserEntity savedUser = userRepository.save(user);
        createProfile(savedUser, request.fullName(), request.role());

        if (request.inviteCode() != null && !request.inviteCode().isBlank()) {
            careNetworkService.acceptInviteForUser(savedUser, request.inviteCode().trim());
        }

        return buildSessionResult(savedUser, "Профиль создан.");
    }

    @Transactional
    public AuthSessionResult login(LoginRequest request) {
        UserEntity user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new UnauthorizedException("Не удалось войти. Проверьте роль, email и пароль."));

        boolean hasRole = user.getRoles().stream().anyMatch(role -> role.getRoleName() == request.role());
        if (!hasRole || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Не удалось войти. Проверьте роль, email и пароль.");
        }

        return buildSessionResult(user, "Вход выполнен.");
    }

    public AuthUserResponse me() {
        return mapToAuthUser(currentUserFacade.requireUser());
    }

    public AuthActionResultResponse logout() {
        currentUserFacade.requireUser();
        return new AuthActionResultResponse(true, "Выход выполнен.");
    }

    private AuthSessionResult buildSessionResult(UserEntity user, String message) {
        return new AuthSessionResult(
                new AuthActionResultResponse(true, message),
                mapToAuthUser(user),
                jwtService.issueToken(user)
        );
    }

    private AuthUserResponse mapToAuthUser(UserEntity user) {
        UserRoleName primaryRole = user.getRoles().stream()
                .map(UserRoleEntity::getRoleName)
                .findFirst()
                .orElseThrow(() -> new BadRequestException("У пользователя не найдена роль."));

        return switch (primaryRole) {
            case senior -> seniorProfileRepository.findByUser(user)
                    .map(profile -> new AuthUserResponse(user.getId(), primaryRole,
                            profile.getFirstName() + " " + profile.getLastName(), user.getEmail(), user.getPhone()))
                    .orElseGet(() -> new AuthUserResponse(user.getId(), primaryRole, user.getEmail(), user.getEmail(), user.getPhone()));
            case caregiver -> caregiverProfileRepository.findByUser(user)
                    .map(profile -> new AuthUserResponse(user.getId(), primaryRole,
                            profile.getDisplayName(), user.getEmail(), user.getPhone()))
                    .orElseGet(() -> new AuthUserResponse(user.getId(), primaryRole, user.getEmail(), user.getEmail(), user.getPhone()));
        };
    }

    private void createProfile(UserEntity user, String fullName, UserRoleName role) {
        String[] parts = fullName.trim().split("\\s+");
        String firstName = parts.length > 0 ? parts[0] : fullName.trim();
        String lastName = parts.length > 1 ? parts[parts.length - 1] : fullName.trim();

        if (role == UserRoleName.senior) {
            SeniorProfileEntity seniorProfile = new SeniorProfileEntity();
            seniorProfile.setId(UUID.randomUUID());
            seniorProfile.setUser(user);
            seniorProfile.setFirstName(firstName);
            seniorProfile.setLastName(lastName);
            seniorProfile.setTimezone("Asia/Barnaul");
            seniorProfile.setPreferredLanguage("ru");
            seniorProfile.setFontScalePreference("large");
            seniorProfile.setVoiceEnabled(true);
            seniorProfile.setOnboardingCompleted(false);
            seniorProfileRepository.save(seniorProfile);
            return;
        }

        CaregiverProfileEntity caregiverProfile = new CaregiverProfileEntity();
        caregiverProfile.setId(UUID.randomUUID());
        caregiverProfile.setUser(user);
        caregiverProfile.setDisplayName(fullName.trim());
        caregiverProfile.setRelationshipDefaultType("relative");
        caregiverProfile.setPhone(user.getPhone());
        caregiverProfile.setEmail(user.getEmail());
        caregiverProfileRepository.save(caregiverProfile);
    }
}
