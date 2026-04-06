package ru.altacare.backend.common.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import ru.altacare.backend.common.errors.UnauthorizedException;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;
import ru.altacare.backend.modules.users.infrastructure.persistence.UserRepository;

@Component
@RequiredArgsConstructor
public class CurrentUserFacade {

    private final UserRepository userRepository;

    public UserEntity requireUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUserPrincipal principal)) {
            throw new UnauthorizedException("Authentication required");
        }

        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user was not found"));
    }
}
