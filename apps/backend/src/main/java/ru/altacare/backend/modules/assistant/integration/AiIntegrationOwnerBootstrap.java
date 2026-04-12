package ru.altacare.backend.modules.assistant.integration;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import ru.altacare.backend.modules.assistant.config.AiIntegrationProperties;

/**
 * Как у остальных приложений: после авторизации по {@code X-API-Key} интеграция ожидает привязку клиента к пользователю
 * (лимиты подписки). Делает то же, что руками: admin JWT → {@code POST /api/admin/clients/{id}/assign-user} с email владельца.
 * Клиент находится по совпадению {@link AiIntegrationProperties#getApiKey()} со списком из {@code GET /api/admin/clients}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiIntegrationOwnerBootstrap implements ApplicationRunner {

    private final RestTemplate aiIntegrationRestTemplate;
    private final AiIntegrationProperties properties;

    private final AtomicBoolean linked = new AtomicBoolean(false);

    @Override
    public void run(ApplicationArguments args) {
        ensureLinked();
    }

    /**
     * Идемпотентно: повторные вызовы безопасны (assign обновляет ту же связь).
     */
    public void ensureLinked() {
        if (!properties.isOwnerBootstrapEnabled()) {
            return;
        }
        if (linked.get()) {
            return;
        }
        synchronized (this) {
            if (linked.get()) {
                return;
            }
            try {
                runOnce();
                linked.set(true);
            } catch (RestClientException e) {
                log.warn("AI integration: привязка клиента к {} не выполнена: {}", properties.getOwnerEmail(), e.getMessage());
            } catch (RuntimeException e) {
                log.warn("AI integration: привязка клиента не выполнена: {}", e.getMessage());
            }
        }
    }

    private void runOnce() {
        String base = properties.getBaseUrl().replaceAll("/+$", "");

        HttpHeaders json = new HttpHeaders();
        json.setContentType(MediaType.APPLICATION_JSON);
        Map<String, String> loginBody =
                Map.of("username", properties.getAdminUsername(), "password", properties.getAdminPassword());
        ResponseEntity<Map<String, Object>> loginResp = aiIntegrationRestTemplate.exchange(
                base + "/api/auth/login",
                HttpMethod.POST,
                new HttpEntity<>(loginBody, json),
                new ParameterizedTypeReference<Map<String, Object>>() {});
        Map<String, Object> login = loginResp.getBody();
        if (login == null || login.get("token") == null) {
            throw new RestClientException("integration login: no token in response");
        }
        String token = login.get("token").toString();

        HttpHeaders auth = new HttpHeaders();
        auth.setBearerAuth(token);
        auth.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<List<Map<String, Object>>> clientsResp = aiIntegrationRestTemplate.exchange(
                base + "/api/admin/clients",
                HttpMethod.GET,
                new HttpEntity<>(auth),
                new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        List<Map<String, Object>> clients = clientsResp.getBody();
        if (clients == null) {
            throw new RestClientException("integration: empty GET /api/admin/clients");
        }

        String wantKey = properties.getApiKey().trim();
        String clientId = null;
        for (Map<String, Object> row : clients) {
            Object k = row.get("apiKey");
            if (k != null && wantKey.equals(k.toString().trim())) {
                clientId = Objects.toString(row.get("id"), null);
                break;
            }
        }
        if (clientId == null) {
            throw new RestClientException(
                    "integration: ни один client в GET /api/admin/clients не совпадает с AI_INTEGRATION_API_KEY");
        }

        Map<String, String> assignBody = Map.of("userEmail", properties.getOwnerEmail());
        aiIntegrationRestTemplate.exchange(
                base + "/api/admin/clients/" + clientId + "/assign-user",
                HttpMethod.POST,
                new HttpEntity<>(assignBody, auth),
                String.class);

        log.info(
                "AI integration: клиент {} привязан к пользователю {} (как у прочих приложений с admin)",
                clientId,
                properties.getOwnerEmail());
    }
}
