package ru.altacare.backend.modules.payments.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.altacare.backend.common.persistence.AuditableEntity;
import ru.altacare.backend.modules.payments.domain.DonationStatus;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "donation_payments")
public class DonationPaymentEntity extends AuditableEntity {

    @Id
    private UUID id;

    @Column(name = "yookassa_payment_id")
    private String yookassaPaymentId;

    @Column(name = "amount_kopecks", nullable = false)
    private long amountKopecks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "demo_mode", nullable = false)
    private boolean demoMode;
}
