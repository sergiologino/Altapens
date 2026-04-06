package ru.altacare.backend.modules.care_network.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.altacare.backend.common.persistence.AuditableEntity;
import ru.altacare.backend.modules.care_network.domain.enums.CareInviteStatus;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "care_invites")
public class CareInviteEntity extends AuditableEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserEntity createdByUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_role", nullable = false)
    private UserRoleName targetRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CareInviteStatus status;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by_user_id")
    private UserEntity acceptedByUser;

    @Column(length = 500)
    private String note;
}
