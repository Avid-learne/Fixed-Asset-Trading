package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setId(1L);
        patient.setName("John Doe");
        patient.setEmail("john@example.com");
        patient.setPhone("1234567890");
        patient.setPassword("password");
        patient.setRegistrationId("PAT-001");
    }

    @Test
    void testRegisterPatient_Success() {
        when(patientRepository.existsByEmail(any())).thenReturn(false);
        when(patientRepository.existsByRegistrationId(any())).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        Patient result = patientService.registerPatient(patient);

        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        verify(patientRepository, times(1)).save(patient);
    }

    @Test
    void testGetPatientById_Success() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        var result = patientService.getPatientById(1L);

        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        assertEquals("john@example.com", result.getEmail());
    }

    @Test
    void testGetPatientById_NotFound() {
        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            patientService.getPatientById(1L);
        });
    }
}