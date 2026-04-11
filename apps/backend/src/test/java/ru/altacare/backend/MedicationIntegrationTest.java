package ru.altacare.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MedicationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void caregiverCreatesMedicationSeniorSeesTodayDoses() throws Exception {
        String caregiverToken = login("caregiver", "anna@altacare.demo", "demo1234");

        String seniorsBody = mockMvc.perform(get("/api/v1/care/seniors")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + caregiverToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID ivanUserId = null;
        for (JsonNode node : objectMapper.readTree(seniorsBody)) {
            if ("ivan@altacare.demo".equalsIgnoreCase(node.path("email").asText())) {
                ivanUserId = UUID.fromString(node.path("userId").asText());
                break;
            }
        }
        if (ivanUserId == null) {
            throw new IllegalStateException("Demo senior ivan@altacare.demo not found in /care/seniors");
        }

        mockMvc.perform(post("/api/v1/care/medications")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + caregiverToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {
                                  "seniorUserId": "%s",
                                  "title": "Тестовый препарат",
                                  "dosageText": "1 таблетка",
                                  "instructions": "После еды.",
                                  "exactTimes": "09:00, 14:00",
                                  "daysOfWeek": "Ежедневно",
                                  "confirmationRequired": true,
                                  "notifyOnMissed": false
                                }
                                """
                                        .formatted(ivanUserId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Тестовый препарат"));

        mockMvc.perform(get("/api/v1/care/medications/today-doses")
                        .param("seniorUserId", ivanUserId.toString())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + caregiverToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].plannedTime").value("09:00"))
                .andExpect(jsonPath("$[1].plannedTime").value("14:00"));

        String seniorToken = login("senior", "ivan@altacare.demo", "demo1234");
        mockMvc.perform(get("/api/v1/care/medications/today-doses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + seniorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Тестовый препарат"));
    }

    @Test
    void seniorRecordsIntakeCheckinAndCaregiverSeesTimeline() throws Exception {
        String caregiverToken = login("caregiver", "anna@altacare.demo", "demo1234");

        String seniorsBody = mockMvc.perform(get("/api/v1/care/seniors")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + caregiverToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID ivanUserId = null;
        for (JsonNode node : objectMapper.readTree(seniorsBody)) {
            if ("ivan@altacare.demo".equalsIgnoreCase(node.path("email").asText())) {
                ivanUserId = UUID.fromString(node.path("userId").asText());
                break;
            }
        }
        if (ivanUserId == null) {
            throw new IllegalStateException("Demo senior ivan@altacare.demo not found in /care/seniors");
        }

        String created = mockMvc.perform(post("/api/v1/care/medications")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + caregiverToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {
                                  "seniorUserId": "%s",
                                  "title": "Интеграционный тест",
                                  "dosageText": "1 таблетка",
                                  "instructions": "После еды.",
                                  "exactTimes": "10:00, 16:00",
                                  "daysOfWeek": "Ежедневно",
                                  "confirmationRequired": false,
                                  "notifyOnMissed": false
                                }
                                """
                                        .formatted(ivanUserId)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID medicationId = UUID.fromString(objectMapper.readTree(created).path("id").asText());

        String seniorToken = login("senior", "ivan@altacare.demo", "demo1234");

        mockMvc.perform(post("/api/v1/care/medications/intake")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + seniorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {
                                  "medicationId": "%s",
                                  "slotIndex": 0,
                                  "status": "taken"
                                }
                                """
                                        .formatted(medicationId)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/care/medications/today-doses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + seniorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title == 'Интеграционный тест' && @.plannedTime == '10:00')].status")
                        .value("taken"));

        mockMvc.perform(post("/api/v1/care/checkins")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + seniorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {
                                  "state": "good",
                                  "note": "Тест самочувствия"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("good"));

        mockMvc.perform(get("/api/v1/care/timeline")
                        .param("seniorUserId", ivanUserId.toString())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + caregiverToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").exists());
    }

    private String login(String role, String email, String password) throws Exception {
        String responseBody = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {
                                  "role": "%s",
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """
                                        .formatted(role, email, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode jsonNode = objectMapper.readTree(responseBody);
        return jsonNode.get("accessToken").asText();
    }
}
