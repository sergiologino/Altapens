package ru.altacare.backend.modules.payments.api;

import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.altacare.backend.common.api.ApiPaths;
import ru.altacare.backend.common.security.AuthUserPrincipal;
import ru.altacare.backend.modules.payments.api.dto.CreateDonationRequest;
import ru.altacare.backend.modules.payments.api.dto.CreateDonationResponse;
import ru.altacare.backend.modules.payments.api.dto.DonationStatusResponse;
import ru.altacare.backend.modules.payments.application.DonationPaymentService;

@RestController
@RequestMapping(ApiPaths.PAYMENTS)
@RequiredArgsConstructor
public class DonationPaymentController {

    private final DonationPaymentService donationPaymentService;

    @PostMapping("/donations")
    public ResponseEntity<CreateDonationResponse> create(
            @Valid @RequestBody CreateDonationRequest request,
            Authentication authentication
    ) {
        UUID userId = resolveUserId(authentication);
        return ResponseEntity.ok(donationPaymentService.create(request.amountRub(), userId));
    }

    @GetMapping("/donations/{donationId}/status")
    public ResponseEntity<DonationStatusResponse> status(@PathVariable UUID donationId) {
        return ResponseEntity.ok(donationPaymentService.getStatus(donationId));
    }

    private static UUID resolveUserId(Authentication authentication) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        if (authentication.getPrincipal() instanceof AuthUserPrincipal p) {
            return p.getUserId();
        }
        return null;
    }
}
