package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.DepositRequest;
import com.fixed_asset.patient_service.model.AssetDeposit;
import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.repository.AssetDepositRepository;
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
public class DepositServiceTest {

    @Mock
    private AssetDepositRepository depositRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private DepositServiceImpl depositService;

    private Patient patient;
    private DepositRequest depositRequest;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setId(1L);
        patient.setName("John Doe");

        depositRequest = new DepositRequest();
        depositRequest.setPatientId(1L);
        depositRequest.setAssetType("GOLD");
        depositRequest.setAssetValue(1000.0);
        depositRequest.setDescription("Gold deposit");
    }

    @Test
    void testSubmitDeposit_Success() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(depositRepository.save(any(AssetDeposit.class))).thenAnswer(invocation -> {
            AssetDeposit deposit = invocation.getArgument(0);
            deposit.setId(1L);
            return deposit;
        });

        var result = depositService.submitDeposit(depositRequest);

        assertNotNull(result);
        assertEquals("GOLD", result.getAssetType());
        assertEquals(1000.0, result.getAssetValue());
        assertEquals("PENDING", result.getStatus());
        verify(depositRepository, times(1)).save(any(AssetDeposit.class));
    }
}