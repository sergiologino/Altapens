package ru.altacare.backend.modules.care_network.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.care_network.domain.entity.CareInviteEntity;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

public interface CareInviteRepository extends JpaRepository<CareInviteEntity, UUID> {

    @EntityGraph(attributePaths = {"createdByUser", "acceptedByUser"})
    Optional<CareInviteEntity> findByCodeIgnoreCase(String code);

    @EntityGraph(attributePaths = {"createdByUser", "acceptedByUser"})
    List<CareInviteEntity> findAllByCreatedByUserOrderByCreatedAtDesc(UserEntity createdByUser);
}
