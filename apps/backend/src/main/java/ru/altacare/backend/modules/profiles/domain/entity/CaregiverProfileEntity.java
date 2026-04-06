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
@Table(name = "caregiver_profiles")
public class CaregiverProfileEntity extends AuditableEntity {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "relationship_default_type", nullable = false)
    private String relationshipDefaultType;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;
}
