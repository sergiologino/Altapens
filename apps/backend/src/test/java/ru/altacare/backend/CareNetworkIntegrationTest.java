package ru.altacare.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class CareNetworkIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void caregiverCanCreateInviteAndLinkedSeniorAppearsInLists() throws Exception {
        String caregiverToken = login("caregiver", "anna@altacare.demo", "demo1234");

        String createInviteResponse = mockMvc.perform(post("/api/v1/care/invites")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + caregiverToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "targetRole": "senior",
                                  "note": "Новый invite для API test"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invite.code").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String inviteCode = objectMapper.readTree(createInviteResponse)
                .path("invite")
                .path("code")
                .asText();

        String registerResponse = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "senior",
                                  "fullName": "Сергей Сергеевич",
                                  "email": "sergey@altacare.demo",
                                  "phone": "+79001000077",
                                  "password": "demo1234",
                                  "inviteCode": "%s"
                                }
                                """.formatted(inviteCode)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.ok").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String seniorToken = objectMapper.readTree(registerResponse).path("accessToken").asText();

        mockMvc.perform(get("/api/v1/care/seniors")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + caregiverToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == 'sergey@altacare.demo')]").exists());

        String caregiversResponse = mockMvc.perform(get("/api/v1/care/caregivers")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + seniorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("anna@altacare.demo"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String relationshipId = objectMapper.readTree(caregiversResponse).get(0).path("relationshipId").asText();

        mockMvc.perform(get("/api/v1/care/relationships/{id}", relationshipId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + caregiverToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.caregiverUserId").isNotEmpty())
                .andExpect(jsonPath("$.seniorUserId").isNotEmpty());
    }

    private String login(String role, String email, String password) throws Exception {
        String responseBody = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "%s",
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(role, email, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode jsonNode = objectMapper.readTree(responseBody);
        return jsonNode.get("accessToken").asText();
    }
}
