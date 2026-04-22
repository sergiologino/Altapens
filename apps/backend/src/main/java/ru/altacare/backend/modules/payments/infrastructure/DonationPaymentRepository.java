package ru.altacare.backend.modules.payments.infrastructure;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.altacare.backend.modules.payments.domain.entity.DonationPaymentEntity;

public interface DonationPaymentRepository extends JpaRepository<DonationPaymentEntity, UUID> {}
