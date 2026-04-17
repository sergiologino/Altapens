package ru.altacare.backend.modules.payments.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import ru.altacare.backend.common.errors.BadRequestException;
import ru.altacare.backend.common.errors.NotFoundException;
import ru.altacare.backend.modules.payments.api.dto.CreateDonationResponse;
import ru.altacare.backend.modules.payments.api.dto.DonationStatusResponse;
import ru.altacare.backend.modules.payments.config.YookassaProperties;
import ru.altacare.backend.modules.payments.domain.DonationStatus;
import ru.altacare.backend.modules.payments.domain.entity.DonationPaymentEntity;
import ru.altacare.backend.modules.payments.infrastructure.DonationPaymentRepository;

@Service
@RequiredArgsConstructor
public class DonationPaymentService {

    private static final String YOOKASSA_API = "https://api.yookassa.ru/v3";

    private final DonationPaymentRepository repository;
    private final YookassaProperties props;
    private final ObjectMapper objectMapper;

    @Transactional
    public CreateDonationResponse create(int amountRub, UUID userId) {
        long kopecks = amountRub * 100L;
        UUID id = UUID.randomUUID();

        if (!props.isEnabled()) {
            DonationPaymentEntity e = new DonationPaymentEntity();
            e.setId(id);
            e.setAmountKopecks(kopecks);
            e.setStatus(DonationStatus.SUCCEEDED);
            e.setUserId(userId);
            e.setDemoMode(true);
            repository.save(e);
            String url = publicBase() + "/donate/return?donationId=" + id + "&demo=1";
            return new CreateDonationResponse(id, url, true);
        }

        if (props.getShopId().isBlank() || props.getSecretKey().isBlank()) {
            throw new BadRequestException("ЮKassa не настроена: задайте app.yookassa.shop-id и secret-key");
        }

        DonationPaymentEntity e = new DonationPaymentEntity();
        e.setId(id);
        e.setAmountKopecks(kopecks);
        e.setStatus(DonationStatus.PENDING);
        e.setUserId(userId);
        e.setDemoMode(false);
        repository.save(e);

        String returnUrl = publicBase() + "/donate/return?donationId=" + id;

        Map<String, Object> amount = new LinkedHashMap<>();
        amount.put("value", String.format(Locale.US, "%.2f", (double) amountRub));
        amount.put("currency", "RUB");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", amount);
        body.put("confirmation", Map.of("type", "redirect", "return_url", returnUrl));
        body.put("capture", true);
        body.put("description", "Пожертвование на развитие AltaPens");
        body.put("metadata", Map.of("donationId", id.toString()));

        try {
            String json = objectMapper.writeValueAsString(body);
            String responseBody = yookassaRestClient()
                    .post()
                    .uri("/payments")
                    .header("Idempotency-Key", id.toString())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseBody);
            String yid = root.path("id").asText(null);
            String confUrl = root.path("confirmation").path("confirmation_url").asText(null);
            if (yid == null || yid.isEmpty() || confUrl == null || confUrl.isEmpty()) {
                throw new BadRequestException("Не удалось создать платёж в ЮKassa");
            }
            e.setYookassaPaymentId(yid);
            repository.save(e);
            return new CreateDonationResponse(id, confUrl, false);
        } catch (BadRequestException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new BadRequestException("Ошибка обращения к ЮKassa: " + ex.getMessage());
        } catch (Exception ex) {
            throw new BadRequestException("Ошибка платёжного провайдера: " + ex.getMessage());
        }
    }

    @Transactional
    public DonationStatusResponse getStatus(UUID donationId) {
        DonationPaymentEntity e = repository
                .findById(donationId)
                .orElseThrow(() -> new NotFoundException("Платёж не найден"));

        if (e.isDemoMode()) {
            return toResponse(e);
        }

        if (e.getYookassaPaymentId() != null && e.getStatus() == DonationStatus.PENDING) {
            syncFromYookassa(e);
        }

        return toResponse(e);
    }

    private DonationStatusResponse toResponse(DonationPaymentEntity e) {
        int rub = (int) (e.getAmountKopecks() / 100);
        return new DonationStatusResponse(
                e.getId(),
                e.getStatus().name().toLowerCase(),
                rub,
                e.isDemoMode()
        );
    }

    private void syncFromYookassa(DonationPaymentEntity e) {
        try {
            String responseBody = yookassaRestClient()
                    .get()
                    .uri("/payments/" + e.getYookassaPaymentId())
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(responseBody);
            String st = root.path("status").asText("");
            DonationStatus mapped = mapYookassaStatus(st);
            if (mapped != e.getStatus()) {
                e.setStatus(mapped);
                repository.save(e);
            }
        } catch (Exception ignored) {
            // оставляем последний известный статус
        }
    }

    private static DonationStatus mapYookassaStatus(String status) {
        if ("succeeded".equals(status)) {
            return DonationStatus.SUCCEEDED;
        }
        if ("canceled".equals(status)) {
            return DonationStatus.CANCELED;
        }
        return DonationStatus.PENDING;
    }

    private RestClient yookassaRestClient() {
        String raw = props.getShopId() + ":" + props.getSecretKey();
        String token = Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
        return RestClient.builder()
                .baseUrl(YOOKASSA_API)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Basic " + token)
                .build();
    }

    private String publicBase() {
        return props.getPublicAppUrl().replaceAll("/$", "");
    }
}
