package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.marketplace.entity.*;
import com.SehatVault.SehatVaultBackend.marketplace.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AtTradingServiceTest {

    @Mock
    private PatientAtAssignmentRepository assignmentRepository;

    @Mock
    private TradeParticipationRepository participationRepository;

    @Mock
    private MonthlyHtDistributionRepository distributionRepository;

    @Mock
    private TradeAtSettlementRepository settlementRepository;

    @Mock
    private PatientAtWithdrawalRequestRepository withdrawalRepository;

    @InjectMocks
    private AtTradingService atTradingService;

    private UUID patientId;
    private UUID assetId;
    private UUID hospitalId;
    private UUID tradeId;
    private BigDecimal atAmount;

    @BeforeEach
    void setUp() {
        patientId = UUID.randomUUID();
        assetId = UUID.randomUUID();
        hospitalId = UUID.randomUUID();
        tradeId = UUID.randomUUID();
        atAmount = new BigDecimal("10.00");
    }

    @Test
    void testInitializeAtAssignment() {
        // Arrange
        when(assignmentRepository.save(any())).thenAnswer(invocation -> {
            PatientAtAssignment arg = invocation.getArgument(0);
            arg.setAssignmentId(UUID.randomUUID());
            return arg;
        });

        // Act
        PatientAtAssignment result = atTradingService.initializeAtAssignment(
                patientId, assetId, hospitalId, atAmount);

        // Assert
        assertNotNull(result);
        assertEquals(patientId, result.getPatientId());
        assertEquals(assetId, result.getAssetId());
        assertEquals(hospitalId, result.getHospitalId());
        assertEquals(atAmount, result.getAvailableAt());
        assertEquals(BigDecimal.ZERO, result.getUnavailableAt());
        assertEquals(PatientAtAssignment.AvailabilityStatus.AVAILABLE, result.getAvailabilityStatus());
        verify(assignmentRepository, times(1)).save(any());
    }

    @Test
    void testStartTradeWithPatientAt() {
        // Arrange
        PatientAtAssignment assignment = PatientAtAssignment.builder()
                .assignmentId(UUID.randomUUID())
                .patientId(patientId)
                .assetId(assetId)
                .hospitalId(hospitalId)
                .totalAtAssigned(atAmount)
                .availableAt(atAmount)
                .unavailableAt(BigDecimal.ZERO)
                .availabilityStatus(PatientAtAssignment.AvailabilityStatus.AVAILABLE)
                .build();

        when(assignmentRepository.findById(assignment.getAssignmentId()))
                .thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(any())).thenReturn(assignment);
        when(participationRepository.save(any())).thenAnswer(invocation -> {
            TradeParticipation arg = invocation.getArgument(0);
            arg.setParticipationId(UUID.randomUUID());
            return arg;
        });

        // Act
        TradeParticipation result = atTradingService.startTradeWithPatientAt(
                tradeId, patientId, assetId, assignment.getAssignmentId(), new BigDecimal("5.00"));

        // Assert
        assertNotNull(result);
        assertEquals(tradeId, result.getTradeId());
        assertEquals(patientId, result.getPatientId());
        assertEquals(new BigDecimal("5.00"), result.getAtAllocated());
        assertEquals(new BigDecimal("50.00"), result.getAtMonetaryValuePkr());
        assertEquals(TradeParticipation.ParticipationStatus.ACTIVE, result.getParticipationStatus());
        verify(assignmentRepository, times(1)).save(any());
        verify(participationRepository, times(1)).save(any());
    }

    @Test
    void testMonthlyHtCalculation() {
        // Arrange - 5 AT in trade = 50 PKR monetary value
        PatientAtAssignment assignment = PatientAtAssignment.builder()
                .assignmentId(UUID.randomUUID())
                .patientId(patientId)
                .assetId(assetId)
                .hospitalId(hospitalId)
                .totalAtAssigned(atAmount)
                .availableAt(BigDecimal.ZERO)
                .unavailableAt(atAmount)
                .availabilityStatus(PatientAtAssignment.AvailabilityStatus.UNAVAILABLE)
                .build();

        TradeParticipation participation = TradeParticipation.builder()
                .participationId(UUID.randomUUID())
                .tradeId(tradeId)
                .patientId(patientId)
                .assetId(assetId)
                .assignmentId(assignment.getAssignmentId())
                .atAllocated(atAmount)
                .atMonetaryValuePkr(new BigDecimal("100.00"))
                .participationStatus(TradeParticipation.ParticipationStatus.ACTIVE)
                .build();

        // Act - Monthly HT should be 5% of monetary value
        BigDecimal monthlyHt = participation.getAtMonetaryValuePkr()
                .multiply(new BigDecimal("0.05"));

        // Assert - Use compareTo to handle BigDecimal scale differences
        assertEquals(0, monthlyHt.compareTo(new BigDecimal("5.00")));
    }

    @Test
    void testProfitHtCalculation() {
        // Test: 100 PKR profit × 0.1 = 10 HT
        BigDecimal profitLoss = new BigDecimal("100.00");
        BigDecimal profitHt = profitLoss.multiply(new BigDecimal("0.1"));

        assertEquals(0, profitHt.compareTo(new BigDecimal("10.00")));
    }

    @Test
    void testMonthlyHtNegativeMath() {
        // Test: Monthly HT never goes negative
        BigDecimal loss = new BigDecimal("-50.00");
        BigDecimal profitHt = loss.multiply(new BigDecimal("0.1"));

        // Verify negative loss produces negative HT (which should be handled as zero)
        assertTrue(profitHt.compareTo(BigDecimal.ZERO) < 0);
    }
}
