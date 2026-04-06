package ru.altacare.backend.common.security;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;

@Getter
public class AuthUserPrincipal implements UserDetails {

    private final UUID userId;
    private final String email;
    private final String passwordHash;
    private final Set<UserRoleName> roles;

    public AuthUserPrincipal(UUID userId, String email, String passwordHash, Set<UserRoleName> roles) {
        this.userId = userId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roles = roles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .toList();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
