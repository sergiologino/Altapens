package ru.altacare.backend.common.config;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.altacare.backend.modules.care_network.domain.entity.CareInviteEntity;
import ru.altacare.backend.modules.care_network.domain.entity.CareRelationshipEntity;
import ru.altacare.backend.modules.care_network.domain.enums.CareInviteStatus;
import ru.altacare.backend.modules.care_network.domain.enums.CareRelationshipStatus;
import ru.altacare.backend.modules.care_network.infrastructure.persistence.CareInviteRepository;
import ru.altacare.backend.modules.care_network.infrastructure.persistence.CareRelationshipRepository;
import ru.altacare.backend.modules.medications.domain.entity.MedicationEntity;
import ru.altacare.backend.modules.medications.infrastructure.persistence.MedicationRepository;
import ru.altacare.backend.modules.profiles.domain.entity.CaregiverProfileEntity;
import ru.altacare.backend.modules.profiles.domain.entity.SeniorProfileEntity;
import ru.altacare.backend.modules.profiles.infrastructure.persistence.CaregiverProfileRepository;
import ru.altacare.backend.modules.profiles.infrastructure.persistence.SeniorProfileRepository;
import ru.altacare.backend.modules.users.domain.entity.UserEntity;
import ru.altacare.backend.modules.users.domain.entity.UserRoleEntity;
import ru.altacare.backend.modules.users.domain.enums.UserRoleName;
import ru.altacare.backend.modules.users.domain.enums.UserStatus;
import ru.altacare.backend.modules.users.infrastructure.persistence.UserRepository;

@Configuration
@RequiredArgsConstructor
public class DemoDataInitializer {

    private final UserRepository userRepository;
    private final SeniorProfileRepository seniorProfileRepository;
    private final CaregiverProfileRepository caregiverProfileRepository;
    private final CareInviteRepository careInviteRepository;
    private final CareRelationshipRepository careRelationshipRepository;
    private final MedicationRepository medicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedDemoData() {
        return args -> {
            if (userRepository.findByEmailIgnoreCase("anna@altacare.demo").isPresent()) {
                return;
            }

            UserEntity annaUser = createUser("anna@altacare.demo", "+7 900 100-00-01", UserRoleName.caregiver);
            CaregiverProfileEntity annaProfile = new CaregiverProfileEntity();
            annaProfile.setId(UUID.randomUUID());
            annaProfile.setUser(annaUser);
            annaProfile.setDisplayName("Анна Смирнова");
            annaProfile.setRelationshipDefaultType("daughter");
            annaProfile.setPhone(annaUser.getPhone());
            annaProfile.setEmail(annaUser.getEmail().toLowerCase(Locale.ROOT));
            caregiverProfileRepository.save(annaProfile);

            UserEntity ivanUser = createUser("ivan@altacare.demo", "+7 900 100-00-02", UserRoleName.senior);
            SeniorProfileEntity ivanProfile = new SeniorProfileEntity();
            ivanProfile.setId(UUID.randomUUID());
            ivanProfile.setUser(ivanUser);
            ivanProfile.setFirstName("Иван");
            ivanProfile.setLastName("Иванович");
            ivanProfile.setTimezone("Asia/Barnaul");
            ivanProfile.setPreferredLanguage("ru");
            ivanProfile.setFontScalePreference("large");
            ivanProfile.setVoiceEnabled(true);
            ivanProfile.setOnboardingCompleted(true);
            seniorProfileRepository.save(ivanProfile);

            CareRelationshipEntity relationship = new CareRelationshipEntity();
            relationship.setId(UUID.randomUUID());
            relationship.setCaregiverProfile(annaProfile);
            relationship.setSeniorProfile(ivanProfile);
            relationship.setStatus(CareRelationshipStatus.active);
            relationship.setInvitedAt(Instant.now().minus(3, ChronoUnit.DAYS));
            relationship.setAcceptedAt(Instant.now().minus(3, ChronoUnit.DAYS));
            careRelationshipRepository.save(relationship);

            MedicationEntity demoMed = new MedicationEntity();
            demoMed.setId(UUID.randomUUID());
            demoMed.setSeniorProfile(ivanProfile);
            demoMed.setTitle("Конкор");
            demoMed.setDosageText("5 мг");
            demoMed.setInstructions("Утром, запить водой.");
            demoMed.setExactTimes("09:00, 20:00");
            demoMed.setDaysOfWeek("Ежедневно");
            demoMed.setConfirmationRequired(true);
            demoMed.setNotifyOnMissed(true);
            medicationRepository.save(demoMed);

            CareInviteEntity invite = new CareInviteEntity();
            invite.setId(UUID.randomUUID());
            invite.setCode("ALTA-CARE-2026");
            invite.setCreatedByUser(annaUser);
            invite.setTargetRole(UserRoleName.senior);
            invite.setStatus(CareInviteStatus.active);
            invite.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS));
            invite.setNote("Код для подключения нового senior к семье Анны.");
            careInviteRepository.save(invite);
        };
    }

    private UserEntity createUser(String email, String phone, UserRoleName roleName) {
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode("demo1234"));
        user.setStatus(UserStatus.active);

        UserRoleEntity role = new UserRoleEntity();
        role.setId(UUID.randomUUID());
        role.setRoleName(roleName);
        user.addRole(role);

        return userRepository.save(user);
    }
}
