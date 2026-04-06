package ru.altacare.backend.modules.care_network.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.altacare.backend.modules.care_network.domain.entity.CareRelationshipEntity;
import ru.altacare.backend.modules.profiles.domain.entity.CaregiverProfileEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;

public interface CareRelationshipRepository extends JpaRepository<CareRelationshipEntity, UUID> {

    @EntityGraph(attributePaths = {"seniorProfile", "seniorProfile.user", "caregiverProfile", "caregiverProfile.user"})
    @Query("select relationship from CareRelationshipEntity relationship where relationship.id = :id")
    Optional<CareRelationshipEntity> findDetailedById(UUID id);

    @EntityGraph(attributePaths = {"seniorProfile", "seniorProfile.user", "caregiverProfile", "caregiverProfile.user"})
    List<CareRelationshipEntity> findAllByCaregiverProfile(CaregiverProfileEntity caregiverProfile);

    @EntityGraph(attributePaths = {"seniorProfile", "seniorProfile.user", "caregiverProfile", "caregiverProfile.user"})
    List<CareRelationshipEntity> findAllBySeniorProfile(SeniorProfileEntity seniorProfile);

    boolean existsByCaregiverProfileAndSeniorProfile(CaregiverProfileEntity caregiverProfile, SeniorProfileEntity seniorProfile);
}
