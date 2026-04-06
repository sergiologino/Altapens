package ru.altacare.backend.modules.profiles.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.altacare.backend.common.persistence.AuditableEntity;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "senior_profiles")
public class SeniorProfileEntity extends AuditableEntity {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "timezone", nullable = false)
    private String timezone;

    @Column(name = "preferred_language", nullable = false)
    private String preferredLanguage;

    @Column(name = "font_scale_preference", nullable = false)
    private String fontScalePreference;

    @Column(name = "voice_enabled", nullable = false)
    private boolean voiceEnabled;

    @Column(name = "onboarding_completed", nullable = false)
    private boolean onboardingCompleted;
}
