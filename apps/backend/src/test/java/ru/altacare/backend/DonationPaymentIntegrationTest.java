package ru.altacare.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DonationPaymentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createDonationBelowMinimumShouldReject() throws Exception {
        mockMvc.perform(post("/api/v1/payments/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amountRub\":99}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createDonationDemoShouldReturnConfirmationUrl() throws Exception {
        mockMvc.perform(post("/api/v1/payments/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amountRub\":100}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.demoMode").value(true))
                .andExpect(jsonPath("$.confirmationUrl").exists())
                .andExpect(jsonPath("$.donationId").exists());
    }

    @Test
    void donationStatusShouldReturnAfterCreate() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/v1/payments/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amountRub\":250}"))
                .andExpect(status().isOk())
                .andReturn();
        String body = created.getResponse().getContentAsString();
        String id = body.split("\"donationId\":\"")[1].split("\"")[0];

        mockMvc.perform(get("/api/v1/payments/donations/" + id + "/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("succeeded"))
                .andExpect(jsonPath("$.amountRub").value(250))
                .andExpect(jsonPath("$.demoMode").value(true));
    }
}
