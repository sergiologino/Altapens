package ru.altacare.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class NotificationDeviceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerDeviceWithoutTokenShouldReject() throws Exception {
        mockMvc.perform(post("/api/v1/notifications/devices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"platform\":\"android\",\"token\":\"fcm-test-1\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void registerDeviceShouldReturnNoContent() throws Exception {
        String token = login("caregiver", "anna@altacare.demo", "demo1234");

        mockMvc.perform(post("/api/v1/notifications/devices")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"platform\":\"android\",\"token\":\"fcm-integration-test-token\"}"))
                .andExpect(status().isNoContent());
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
