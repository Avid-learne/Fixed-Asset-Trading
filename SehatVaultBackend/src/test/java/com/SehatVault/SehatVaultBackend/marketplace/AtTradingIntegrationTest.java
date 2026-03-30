package com.SehatVault.SehatVaultBackend.marketplace;

import com.SehatVault.SehatVaultBackend.marketplace.entity.*;
import com.SehatVault.SehatVaultBackend.marketplace.repository.*;
import com.SehatVault.SehatVaultBackend.marketplace.service.AtTradingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AtTradingIntegrationTest {

    @Autowired
    private AtTradingService atTradingService;

    @Autowired
    private PatientAtAssignmentRepository assignmentRepository;

    private UUID patientId;
    private UUID assetId;
    private UUID hospitalId;
    private UUID tradeId;

    @BeforeEach
    void setUp() {
        patientId = UUID.randomUUID();
        assetId = UUID.randomUUID();
        hospitalId = UUID.randomUUID();
        tradeId = UUID.randomUUID();
    }

    @Test
    void testAtAssignmentInitialization() {
        // Test: Initialize AT assignment
        PatientAtAssignment assignment = atTradingService.initializeAtAssignment(
                patientId, assetId, hospitalId, new BigDecimal("100.00"));

        assertNotNull(assignment);
        assertEquals(new BigDecimal("100.00"), assignment.getTotalAtAssigned());
        assertEquals(new BigDecimal("100.00"), assignment.getAvailableAt());
        assertEquals(BigDecimal.ZERO, assignment.getUnavailableAt());
        assertEquals(PatientAtAssignment.AvailabilityStatus.AVAILABLE, assignment.getAvailabilityStatus());

        // Verify in database
        PatientAtAssignment saved = assignmentRepository.findById(assignment.getAssignmentId()).get();
        assertNotNull(saved);
        assertEquals(patientId, saved.getPatientId());
        assertEquals(assetId, saved.getAssetId());
    }

    @Test
    void testAtAssignmentPersistence() {
        // Test: Multiple AT assignments can be created and persisted
        PatientAtAssignment assignment1 = atTradingService.initializeAtAssignment(
                patientId, assetId, hospitalId, new BigDecimal("25.00"));

        PatientAtAssignment assignment2 = atTradingService.initializeAtAssignment(
                patientId, assetId, hospitalId, new BigDecimal("75.00"));

        // Verify both assignments exist in database
        assertTrue(assignmentRepository.findById(assignment1.getAssignmentId()).isPresent());
        assertTrue(assignmentRepository.findById(assignment2.getAssignmentId()).isPresent());

        // Verify amounts are correct using compareTo to avoid BigDecimal scale issues
        assertEquals(0, assignmentRepository.findById(assignment1.getAssignmentId()).get()
                .getTotalAtAssigned().compareTo(new BigDecimal("25.00")));
        assertEquals(0, assignmentRepository.findById(assignment2.getAssignmentId()).get()
                .getTotalAtAssigned().compareTo(new BigDecimal("75.00")));
    }

    @Test
    void testMultipleConcurrentTrades() {
        UUID trade1 = UUID.randomUUID();
        UUID trade2 = UUID.randomUUID();

        // Initialize assignment
        PatientAtAssignment assignment = atTradingService.initializeAtAssignment(
                patientId, assetId, hospitalId, new BigDecimal("50.00"));

        // Start trade 1 with 15 AT
        TradeParticipation part1 = atTradingService.startTradeWithPatientAt(
                trade1, patientId, assetId, assignment.getAssignmentId(), new BigDecimal("15.00"));

        // Start trade 2 with 20 AT
        TradeParticipation part2 = atTradingService.startTradeWithPatientAt(
                trade2, patientId, assetId, assignment.getAssignmentId(), new BigDecimal("20.00"));

        // Verify both active
        assertEquals(TradeParticipation.ParticipationStatus.ACTIVE, part1.getParticipationStatus());
        assertEquals(TradeParticipation.ParticipationStatus.ACTIVE, part2.getParticipationStatus());

        // Verify remaining AT available
        PatientAtAssignment updated = assignmentRepository.findById(assignment.getAssignmentId()).get();
        assertEquals(0, updated.getAvailableAt().compareTo(new BigDecimal("15.00"))); // 50 - 15 - 20
        assertEquals(0, updated.getUnavailableAt().compareTo(new BigDecimal("35.00")));
    }

    @Test
    void testInsufficientAtHandling() {
        // Initialize with limited AT
        PatientAtAssignment assignment = atTradingService.initializeAtAssignment(
                patientId, assetId, hospitalId, new BigDecimal("5.00"));

        // Try to allocate more than available
        assertThrows(RuntimeException.class, () -> {
            atTradingService.startTradeWithPatientAt(
                    tradeId, patientId, assetId, assignment.getAssignmentId(), new BigDecimal("10.00"));
        });
    }
}
