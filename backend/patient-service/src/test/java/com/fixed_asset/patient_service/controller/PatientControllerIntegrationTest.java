package com.fixed_asset.patient_service.controller;

import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.repository.PatientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class PatientControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setName("Test Patient");
        patient.setEmail("test@example.com");
        patient.setPhone("1234567890");
        patient.setPassword("password");
        patient.setRegistrationId("TEST-001");
        
        patient = patientRepository.save(patient);
    }

    @Test
    void testGetPatientById() throws Exception {
        mockMvc.perform(get("/api/patients/{id}", patient.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Patient"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void testRegisterPatient() throws Exception {
        Patient newPatient = new Patient();
        newPatient.setName("New Patient");
        newPatient.setEmail("new@example.com");
        newPatient.setPhone("0987654321");
        newPatient.setPassword("password");
        newPatient.setRegistrationId("NEW-001");

        mockMvc.perform(post("/api/patients/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newPatient)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Patient"));
    }
}