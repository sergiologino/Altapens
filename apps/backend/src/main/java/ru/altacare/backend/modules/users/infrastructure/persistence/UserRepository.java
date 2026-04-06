package ru.altacare.backend.modules.users.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    @EntityGraph(attributePaths = {"roles"})
    Optional<UserEntity> findByEmailIgnoreCase(String email);
}
