package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.marketplace.dto.PatientAssetTokenDto;
import com.SehatVault.SehatVaultBackend.marketplace.entity.*;
import com.SehatVault.SehatVaultBackend.marketplace.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing AT (Asset Token) trading lifecycle.
 * Handles:
 * - AT availability tracking
 * - Trade participation with AT allocation
 * - Monthly HT distributions (5% of AT monetary value)
 * - Trade settlement and AT return
 * - Withdrawal request handling
 */
@Slf4j
@Service
public class AtTradingService {

        private static final BigDecimal AT_TO_PKR = new BigDecimal("10");
        private static final BigDecimal MONTHLY_HT_PERCENTAGE = new BigDecimal("0.05");
        private static final int SCALE = 2;

        @Autowired
        private PatientAtAssignmentRepository patientAtAssignmentRepository;

        @Autowired
        private TradeParticipationRepository tradeParticipationRepository;

        @Autowired
        private MonthlyHtDistributionRepository monthlyHtDistributionRepository;

        @Autowired
        private TradeAtSettlementRepository tradeAtSettlementRepository;

        @Autowired
        private PatientAtWithdrawalRequestRepository withdrawalRequestRepository;

        @Autowired
        private AssetDepositRepository assetDepositRepository;

        /**
         * Initialize AT assignment when patient deposits assets
         */
        @Transactional
        public PatientAtAssignment initializeAtAssignment(UUID patientId, UUID assetId, UUID hospitalId,
                        BigDecimal atAmount) {
                log.info("Initializing AT assignment for patient {} with asset {} and amount {}", patientId, assetId,
                                atAmount);

                PatientAtAssignment assignment = PatientAtAssignment.builder()
                                .patientId(patientId)
                                .assetId(assetId)
                                .hospitalId(hospitalId)
                                .totalAtAssigned(atAmount)
                                .availableAt(atAmount)
                                .unavailableAt(BigDecimal.ZERO)
                                .availabilityStatus(PatientAtAssignment.AvailabilityStatus.AVAILABLE)
                                .build();

                return patientAtAssignmentRepository.save(assignment);
        }

        /**
         * Get all available AT for a patient
         */
        public List<PatientAtAssignment> getAvailableAtForPatient(UUID patientId) {
                return patientAtAssignmentRepository.findAvailableAtByPatientId(patientId);
        }

        /**
         * Get total available AT amount for a patient
         */
        public BigDecimal getTotalAvailableAtForPatient(UUID patientId) {
                return patientAtAssignmentRepository.findAvailableAtByPatientId(patientId)
                                .stream()
                                .map(PatientAtAssignment::getAvailableAt)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        /**
         * Start a trade with patient's AT
         * - Create trade participation
         * - Mark AT as unavailable
         * - Schedule monthly HT distributions
         */
        @Transactional
        public TradeParticipation startTradeWithPatientAt(UUID tradeId, UUID patientId, UUID assetId, UUID assignmentId,
                        BigDecimal atToAllocate) {
                log.info("Starting trade {} with patient {} AT amount {}", tradeId, patientId, atToAllocate);

                // Fetch assignment
                PatientAtAssignment assignment = patientAtAssignmentRepository.findById(assignmentId)
                                .orElseThrow(() -> new RuntimeException("Assignment not found"));

                // Validate available AT
                if (assignment.getAvailableAt().compareTo(atToAllocate) < 0) {
                        throw new RuntimeException("Insufficient available AT");
                }

                // Calculate monetary value
                BigDecimal monetaryValue = atToAllocate.multiply(AT_TO_PKR);

                // Create trade participation
                TradeParticipation participation = TradeParticipation.builder()
                                .tradeId(tradeId)
                                .patientId(patientId)
                                .assetId(assetId)
                                .assignmentId(assignmentId)
                                .atAllocated(atToAllocate)
                                .atMonetaryValuePkr(monetaryValue)
                                .participationStatus(TradeParticipation.ParticipationStatus.ACTIVE)
                                .tradeStartTime(LocalDateTime.now())
                                .markedUnavailableAt(LocalDateTime.now())
                                .build();

                TradeParticipation savedParticipation = tradeParticipationRepository.save(participation);

                // Update assignment - mark AT as unavailable
                assignment.setAvailableAt(assignment.getAvailableAt().subtract(atToAllocate));
                assignment.setUnavailableAt(assignment.getUnavailableAt().add(atToAllocate));
                assignment.setAvailabilityStatus(PatientAtAssignment.AvailabilityStatus.UNAVAILABLE);
                patientAtAssignmentRepository.save(assignment);

                log.info("Trade participation created with ID: {}", savedParticipation.getParticipationId());

                return savedParticipation;
        }

        /**
         * Calculate and create monthly HT distribution (5% of AT monetary value)
         */
        @Transactional
        public MonthlyHtDistribution createMonthlyHtDistribution(UUID tradeId, UUID participationId, UUID patientId,
                        LocalDate distributionMonth) {
                log.info("Creating monthly HT distribution for trade {} month {}", tradeId, distributionMonth);

                TradeParticipation participation = tradeParticipationRepository.findById(participationId)
                                .orElseThrow(() -> new RuntimeException("Participation not found"));

                // Calculate 5% HT amount
                BigDecimal atAmountBase = participation.getAtMonetaryValuePkr();
                BigDecimal calculatedHt = atAmountBase.multiply(MONTHLY_HT_PERCENTAGE).setScale(SCALE,
                                RoundingMode.HALF_UP);

                MonthlyHtDistribution distribution = MonthlyHtDistribution.builder()
                                .tradeId(tradeId)
                                .participationId(participationId)
                                .patientId(patientId)
                                .distributionMonth(distributionMonth)
                                .atPercentageRate(MONTHLY_HT_PERCENTAGE.multiply(new BigDecimal("100")))
                                .atAmountBase(atAmountBase)
                                .calculatedHtAmount(calculatedHt)
                                .isDistributed(false)
                                .build();

                MonthlyHtDistribution saved = monthlyHtDistributionRepository.save(distribution);
                log.info("Monthly HT distribution created: {} HT", calculatedHt);

                return saved;
        }

        /**
         * Get pending monthly HT distributions for a patient
         */
        public List<MonthlyHtDistribution> getPendingMonthlyHtDistributions(UUID patientId) {
                return monthlyHtDistributionRepository.findPendingDistributionsByPatientId(patientId);
        }

        /**
         * Process monthly HT distribution (distribute HT to patient)
         */
        @Transactional
        public void distributeMonthlyHt(UUID distributionId) {
                log.info("Distributing monthly HT for distribution {}", distributionId);

                MonthlyHtDistribution distribution = monthlyHtDistributionRepository.findById(distributionId)
                                .orElseThrow(() -> new RuntimeException("Distribution not found"));

                if (distribution.getIsDistributed()) {
                        log.warn("Distribution {} already processed", distributionId);
                        return;
                }

                // Mark as distributed (actual HT transfer would be handled by wallet/blockchain
                // service)
                distribution.markAsDistributed();
                monthlyHtDistributionRepository.save(distribution);

                log.info("Monthly HT {} distributed to patient {}", distribution.getCalculatedHtAmount(),
                                distribution.getPatientId());
        }

        /**
         * Request to withdraw AT (patient requests their AT back)
         */
        @Transactional
        public PatientAtWithdrawalRequest requestAtWithdrawal(UUID patientId, UUID assetId, UUID tradeId,
                        UUID assignmentId,
                        String reason) {
                log.info("Patient {} requesting AT withdrawal for trade {}", patientId, tradeId);

                // Check if already has pending request
                Optional<PatientAtWithdrawalRequest> existing = withdrawalRequestRepository
                                .findPendingRequestByPatientAssetAndTrade(patientId, assetId, tradeId);

                if (existing.isPresent()) {
                        throw new RuntimeException(
                                        "Patient already has a pending withdrawal request for this asset and trade");
                }

                PatientAtWithdrawalRequest request = PatientAtWithdrawalRequest.builder()
                                .patientId(patientId)
                                .assetId(assetId)
                                .tradeId(tradeId)
                                .assignmentId(assignmentId)
                                .requestedAt(LocalDateTime.now())
                                .reason(reason)
                                .requestStatus(PatientAtWithdrawalRequest.WithdrawalRequestStatus.PENDING)
                                .build();

                return withdrawalRequestRepository.save(request);
        }

        /**
         * Approve withdrawal request (hospital must inform patient to wait for trade to
         * end)
         */
        @Transactional
        public PatientAtWithdrawalRequest approveWithdrawalRequest(UUID requestId, Integer tradeRemainingDays,
                        String hospitalNotes) {
                log.info("Approving withdrawal request {} with {} days remaining", requestId, tradeRemainingDays);

                PatientAtWithdrawalRequest request = withdrawalRequestRepository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Request not found"));

                request.approve(tradeRemainingDays);
                request.setHospitalNotes(hospitalNotes);
                request.markAsNotified();

                return withdrawalRequestRepository.save(request);
        }

        /**
         * Settle trade and return AT to patient
         * - Calculate profit/loss
         * - Issue HT based on profit
         * - Mark AT as available again
         * - Process any pending withdrawal requests
         */
        @Transactional
        public TradeAtSettlement settleTrade(UUID tradeId, BigDecimal profitLoss) {
                log.info("Settling trade {} with profit/loss {}", tradeId, profitLoss);

                // Get all active participations for this trade
                List<TradeParticipation> participations = tradeParticipationRepository
                                .findActiveParticipationsByTradeId(tradeId);

                if (participations.isEmpty()) {
                        throw new RuntimeException("No active participations found for trade");
                }

                // Process each participation
                for (TradeParticipation participation : participations) {
                        settleTradeParticipation(tradeId, participation, profitLoss);
                }

                log.info("Trade {} settlement completed", tradeId);
                return null; // Return the main settlement record if needed
        }

        /**
         * Settle individual trade participation
         */
        @Transactional
        private TradeAtSettlement settleTradeParticipation(UUID tradeId, TradeParticipation participation,
                        BigDecimal profitLoss) {
                log.info("Settling participation {} for patient {}", participation.getParticipationId(),
                                participation.getPatientId());

                // Get total monthly HT distributed
                List<MonthlyHtDistribution> monthlyDistributions = monthlyHtDistributionRepository
                                .findByParticipationId(participation.getParticipationId());

                BigDecimal totalMonthlyHt = monthlyDistributions.stream()
                                .map(MonthlyHtDistribution::getCalculatedHtAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Calculate profit percentage
                BigDecimal participationProfitLoss = profitLoss.multiply(participation.getAtAllocated()).divide(
                                monthlyDistributions.stream()
                                                .map(MonthlyHtDistribution::getAtAmountBase)
                                                .reduce(BigDecimal.ZERO, BigDecimal::add),
                                SCALE, RoundingMode.HALF_UP);

                // Calculate HT to be issued based on profit
                BigDecimal profitHtIssued = calculateProfitHt(participationProfitLoss);

                // Create settlement record
                TradeAtSettlement settlement = TradeAtSettlement.builder()
                                .tradeId(tradeId)
                                .participationId(participation.getParticipationId())
                                .patientId(participation.getPatientId())
                                .originalAtAllocated(participation.getAtAllocated())
                                .tradeProfitLoss(participationProfitLoss)
                                .atReturnedAvailable(participation.getAtAllocated())
                                .profitPercentage(participationProfitLoss.divide(participation.getAtMonetaryValuePkr(),
                                                SCALE,
                                                RoundingMode.HALF_UP))
                                .profitHtIssued(profitHtIssued)
                                .totalMonthlyHtIssued(totalMonthlyHt)
                                .tradeEndTime(LocalDateTime.now())
                                .settledAt(LocalDateTime.now())
                                .build();

                TradeAtSettlement savedSettlement = tradeAtSettlementRepository.save(settlement);

                // Update participation status
                participation.setParticipationStatus(TradeParticipation.ParticipationStatus.SETTLED);
                participation.setTradeEndTime(LocalDateTime.now());
                tradeParticipationRepository.save(participation);

                // Return AT to assignment as available
                PatientAtAssignment assignment = patientAtAssignmentRepository.findById(participation.getAssignmentId())
                                .orElseThrow(() -> new RuntimeException("Assignment not found"));

                assignment.setUnavailableAt(assignment.getUnavailableAt().subtract(participation.getAtAllocated()));
                assignment.setAvailableAt(assignment.getAvailableAt().add(participation.getAtAllocated()));

                if (assignment.getUnavailableAt().compareTo(BigDecimal.ZERO) == 0) {
                        assignment.setAvailabilityStatus(PatientAtAssignment.AvailabilityStatus.AVAILABLE);
                }

                patientAtAssignmentRepository.save(assignment);

                // Process any pending withdrawal requests for this trade
                processPendingWithdrawals(tradeId, participation.getPatientId());

                log.info("Trade participation settlement completed with total HT: {}",
                                savedSettlement.getTotalHtIssued());

                return savedSettlement;
        }

        /**
         * Calculate HT to be issued based on trade profit
         * Simple formula: profit_loss_amount * conversion_factor
         */
        private BigDecimal calculateProfitHt(BigDecimal profitLoss) {
                // If loss, no HT issued
                if (profitLoss.compareTo(BigDecimal.ZERO) <= 0) {
                        return BigDecimal.ZERO;
                }
                // Convert profit to HT (simple conversion: 1 PKR profit = 0.1 HT)
                return profitLoss.multiply(new BigDecimal("0.1")).setScale(SCALE, RoundingMode.HALF_UP);
        }

        /**
         * Process pending withdrawal requests when trade ends
         */
        @Transactional
        private void processPendingWithdrawals(UUID tradeId, UUID patientId) {
                List<PatientAtWithdrawalRequest> approvedRequests = withdrawalRequestRepository
                                .findByTradeId(tradeId)
                                .stream()
                                .filter(r -> r.getRequestStatus() == PatientAtWithdrawalRequest.WithdrawalRequestStatus.APPROVED)
                                .toList();

                for (PatientAtWithdrawalRequest request : approvedRequests) {
                        request.markAsRetrieved();
                        withdrawalRequestRepository.save(request);
                        log.info("Processed withdrawal request {} - AT returned to patient", request.getRequestId());
                }
        }

        /**
         * Get withdrawal request status for a patient
         */
        public PatientAtWithdrawalRequest getWithdrawalRequestStatus(UUID requestId) {
                return withdrawalRequestRepository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Request not found"));
        }

        /**
         * Get all active AT trades for a patient
         */
        public List<TradeParticipation> getActiveAtTradesForPatient(UUID patientId) {
                return tradeParticipationRepository.findActiveParticipationsByPatientId(patientId);
        }

        /**
         * Get summary of patient's AT status
         */
        public AtStatusSummary getPatientAtStatusSummary(UUID patientId) {
                BigDecimal totalAvailable = getTotalAvailableAtForPatient(patientId);

                BigDecimal totalUnavailable = patientAtAssignmentRepository.findUnavailableAtByPatientId(patientId)
                                .stream()
                                .map(PatientAtAssignment::getUnavailableAt)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                List<MonthlyHtDistribution> pendingHt = getPendingMonthlyHtDistributions(patientId);
                BigDecimal totalPendingHt = pendingHt.stream()
                                .map(MonthlyHtDistribution::getCalculatedHtAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                List<PatientAtWithdrawalRequest> activeWithdrawals = withdrawalRequestRepository
                                .findActiveRequestsByPatientId(patientId);

                return AtStatusSummary.builder()
                                .patientId(patientId)
                                .totalAvailableAt(totalAvailable)
                                .totalUnavailableAt(totalUnavailable)
                                .totalAt(totalAvailable.add(totalUnavailable))
                                .pendingMonthlyHtAmount(totalPendingHt)
                                .activeTradeCount(getActiveAtTradesForPatient(patientId).size())
                                .activeWithdrawalRequests(activeWithdrawals)
                                .build();
        }

        /**
         * Get patient's linked asset tokens with AT assignment and availability status
         * Combines AssetDeposit and PatientAtAssignment information
         */
        public List<PatientAssetTokenDto> getPatientAssetTokens(UUID patientId) {
                log.info("Fetching asset tokens for patient {}", patientId);

                // Get all asset deposits for the patient
                List<AssetDeposit> deposits = assetDepositRepository.findByPatientId(patientId);

                // Get all AT assignments for the patient
                List<PatientAtAssignment> assignments = patientAtAssignmentRepository.findByPatientId(patientId);

                // Convert assigned AT to DTOs
                var assignedTokens = assignments.stream()
                                .map(assignment -> {
                                        // Find corresponding deposit
                                        AssetDeposit deposit = deposits.stream()
                                                        .filter(d -> d.getAssetId().equals(assignment.getAssetId()))
                                                        .findFirst()
                                                        .orElse(null);

                                        PatientAssetTokenDto dto = PatientAssetTokenDto.builder()
                                                        .assetId(assignment.getAssetId())
                                                        .assignmentId(assignment.getAssignmentId())
                                                        .hospitalId(assignment.getHospitalId())
                                                        .totalAtAssigned(assignment.getTotalAtAssigned())
                                                        .availableAt(assignment.getAvailableAt())
                                                        .unavailableAt(assignment.getTotalAtAssigned().subtract(assignment.getAvailableAt()))
                                                        .availabilityStatus(
                                                                        assignment.getAvailabilityStatus().toString())
                                                        .assignedAt(assignment.getCreatedAt())
                                                        .monetaryValuePkr(assignment.getTotalAtAssigned()
                                                                        .multiply(AT_TO_PKR))
                                                        .availableMonetaryValuePkr(
                                                                        assignment.getAvailableAt().multiply(AT_TO_PKR))
                                                        .unavailableMonetaryValuePkr(assignment.getTotalAtAssigned().subtract(assignment.getAvailableAt())
                                                                        .multiply(AT_TO_PKR))
                                                        .build();

                                        // Add deposit info if exists
                                        if (deposit != null) {
                                                dto.setAssetType(deposit.getAssetType());
                                                dto.setAssetValue(deposit.getAssetValue());
                                                dto.setWeight(deposit.getWeight());
                                                dto.setDepositStatus(deposit.getStatus());
                                                dto.setSubmittedAt(deposit.getSubmittedAt());
                                                dto.setApprovedAt(deposit.getApprovedAt());
                                        }

                                        return dto;
                                })
                                .toList();

                // Also include approved deposits with expected AT tokens (pending bank
                // approval)
                var approvedDepositsWithPendingAt = deposits.stream()
                                .filter(d -> "approved".equalsIgnoreCase(d.getStatus()))
                                .filter(d -> assignments.stream().noneMatch(a -> a.getAssetId().equals(d.getAssetId())))
                                .map(deposit -> {
                                        // Calculate expected AT based on asset value
                                        // Formula: Asset Value / 100 = AT tokens
                                        BigDecimal expectedAt = deposit.getAssetValue() != null
                                                        ? deposit.getAssetValue().divide(new BigDecimal("100"), 2,
                                                                        java.math.RoundingMode.DOWN)
                                                        : BigDecimal.ZERO;

                                        PatientAssetTokenDto dto = PatientAssetTokenDto.builder()
                                                        .assetId(deposit.getAssetId())
                                                        .hospitalId(null) // Hospital ID will be fetched from
                                                                          // assignments if needed
                                                        .assetType(deposit.getAssetType())
                                                        .assetValue(deposit.getAssetValue())
                                                        .weight(deposit.getWeight())
                                                        .depositStatus(deposit.getStatus())
                                                        .submittedAt(deposit.getSubmittedAt())
                                                        .approvedAt(deposit.getApprovedAt())
                                                        .totalAtAssigned(expectedAt)
                                                        .availableAt(BigDecimal.ZERO) // Not assigned yet
                                                        .unavailableAt(expectedAt) // total - available = expectedAt - 0
                                                        .availabilityStatus("PENDING_BANK_APPROVAL")
                                                        .monetaryValuePkr(expectedAt.multiply(AT_TO_PKR))
                                                        .availableMonetaryValuePkr(BigDecimal.ZERO)
                                                        .unavailableMonetaryValuePkr(expectedAt.multiply(AT_TO_PKR))
                                                        .build();

                                        return dto;
                                })
                                .toList();

                // Combine assigned and pending tokens
                var result = new java.util.ArrayList<>(assignedTokens);
                result.addAll(approvedDepositsWithPendingAt);
                return result;
        }

        /**
         * DTO for AT status summary
         */
        @lombok.Data
        @lombok.Builder
        public static class AtStatusSummary {
                private UUID patientId;
                private BigDecimal totalAvailableAt;
                private BigDecimal totalUnavailableAt;
                private BigDecimal totalAt;
                private BigDecimal pendingMonthlyHtAmount;
                private int activeTradeCount;
                private List<PatientAtWithdrawalRequest> activeWithdrawalRequests;
        }
}
