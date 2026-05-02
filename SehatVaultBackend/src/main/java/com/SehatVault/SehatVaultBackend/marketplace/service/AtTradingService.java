package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.marketplace.dto.PatientAssetTokenDto;
import com.SehatVault.SehatVaultBackend.marketplace.entity.*;
import com.SehatVault.SehatVaultBackend.marketplace.repository.*;
import com.SehatVault.SehatVaultBackend.wallet.service.TokenPriceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
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

        private static final BigDecimal MONTHLY_HT_PERCENTAGE = new BigDecimal("0.05");
        private static final int SCALE = 2;

        @Autowired
        private TokenPriceService tokenPriceService;

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

        @Autowired
        private com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository patientTokenBalanceRepository;

        @Autowired
        private HospitalAtPoolEntryRepository hospitalAtPoolEntryRepository;

        // Self-proxy reference: needed so per-participation @Transactional(REQUIRES_NEW) actually
        // takes effect when called from within this service. Direct `this.` calls bypass Spring AOP
        // and would re-use the outer transaction, which is exactly the bug that left multi-participant
        // settles all-or-nothing.
        @Lazy
        @Autowired
        private AtTradingService self;

        /**
         * Initialize AT assignment when patient deposits assets — DEFAULT into Pool 2.
         * Prefer initializeAtAssignmentWithPatient for the dual-pool flow.
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
         * Initialize AT assignment in Pool 1 (Available Pool, with patient).
         * AT is minted but NOT yet released to the hospital trading pool. Patient
         * may use Use Case 3 emergency redemption against this AT until the hospital
         * admin moves it into Pool 2 (Trading).
         */
        @Transactional
        public PatientAtAssignment initializeAtAssignmentWithPatient(UUID patientId, UUID assetId, UUID hospitalId,
                        BigDecimal atAmount) {
                log.info("Initializing Pool 1 AT assignment for patient {} asset {} amount {}", patientId, assetId,
                                atAmount);

                PatientAtAssignment assignment = PatientAtAssignment.builder()
                                .patientId(patientId)
                                .assetId(assetId)
                                .hospitalId(hospitalId)
                                .totalAtAssigned(atAmount)
                                .availableAt(atAmount)
                                .unavailableAt(BigDecimal.ZERO)
                                .availabilityStatus(PatientAtAssignment.AvailabilityStatus.WITH_PATIENT)
                                .build();

                return patientAtAssignmentRepository.save(assignment);
        }

        /**
         * Hospital admin releases an assignment from Pool 1 into Pool 2 (Trading).
         * Flips status WITH_PATIENT → AVAILABLE. Caller is responsible for adding
         * the AT to the hospital trading pool entry and starting baseline HT.
         */
        @Transactional
        public PatientAtAssignment releaseForTrading(UUID patientId, UUID assetId) {
                PatientAtAssignment assignment = patientAtAssignmentRepository
                                .findByPatientIdAndAssetId(patientId, assetId)
                                .orElseThrow(() -> new RuntimeException("AT assignment not found for this asset"));

                if (assignment.getAvailabilityStatus() != PatientAtAssignment.AvailabilityStatus.WITH_PATIENT) {
                        throw new RuntimeException("AT is already in the Trading Pool or in an active trade");
                }
                if (Boolean.TRUE.equals(assignment.getTradingOptOut())) {
                        throw new RuntimeException("Patient has blocked this asset from trading; cannot move to Pool 2");
                }

                assignment.setAvailabilityStatus(PatientAtAssignment.AvailabilityStatus.AVAILABLE);
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
                BigDecimal monetaryValue = atToAllocate.multiply(tokenPriceService.getAtPricePkr());

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
         * Settle trade and return AT to patients.
         *
         * Per-participation work runs in its own REQUIRES_NEW transaction (via the self proxy),
         * so a failure on one patient's settlement no longer rolls back the others — the bug
         * that left multi-participant trades stuck in Pool 2.
         *
         * Loss distribution: shares are proportional to atAllocated (biggest allocation =
         * biggest share of loss). The last participant absorbs any rounding remainder so the
         * sum of per-patient losses equals the trade's total loss exactly.
         */
        // No outer @Transactional — each participation owns its own transaction.
        public TradeAtSettlement settleTrade(UUID tradeId, BigDecimal profitLoss) {
                log.info("Settling trade {} with profit/loss {}", tradeId, profitLoss);

                List<TradeParticipation> participations = tradeParticipationRepository
                                .findActiveParticipationsByTradeId(tradeId);

                if (participations.isEmpty()) {
                        log.info("No active participations found for trade {} - skipping settlement", tradeId);
                        return null;
                }

                BigDecimal totalAllocatedAt = participations.stream()
                                .map(TradeParticipation::getAtAllocated)
                                .map(v -> v == null ? BigDecimal.ZERO : v)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal pl = profitLoss == null ? BigDecimal.ZERO : profitLoss;

                int succeeded = 0;
                int failed = 0;
                BigDecimal cumulativeShare = BigDecimal.ZERO;

                for (int i = 0; i < participations.size(); i++) {
                        TradeParticipation p = participations.get(i);
                        boolean isLast = i == participations.size() - 1;

                        BigDecimal share;
                        if (totalAllocatedAt.compareTo(BigDecimal.ZERO) <= 0) {
                                share = BigDecimal.ZERO;
                        } else if (isLast) {
                                // Last participant absorbs the rounding remainder so the sum of shares
                                // equals the trade's total P/L exactly.
                                share = pl.subtract(cumulativeShare).setScale(SCALE, RoundingMode.HALF_UP);
                        } else {
                                BigDecimal allocated = p.getAtAllocated() == null ? BigDecimal.ZERO : p.getAtAllocated();
                                share = pl.multiply(allocated)
                                                .divide(totalAllocatedAt, 10, RoundingMode.HALF_UP)
                                                .setScale(SCALE, RoundingMode.HALF_UP);
                                cumulativeShare = cumulativeShare.add(share);
                        }

                        // Capture pre-shrink amounts BEFORE release runs — we need these to write
                        // the settlement record's "originalAtAllocated" correctly. Once release
                        // commits, participation.atAllocated holds the post-loss value.
                        BigDecimal originalAtSnapshot = p.getAtAllocated() == null
                                        ? BigDecimal.ZERO : p.getAtAllocated();

                        // Step 1 (CRITICAL, own committed transaction): release the asset back to
                        // Pool 1 with the loss applied. If this succeeds, the patient's asset is
                        // out of Pool 2 even if every later side-effect blows up.
                        boolean released = false;
                        try {
                                self.releaseParticipationToPool1(p.getParticipationId(), share);
                                released = true;
                        } catch (Exception ex) {
                                log.error("Critical release failed for participation {} of trade {}: {} — falling back to force-release",
                                                p.getParticipationId(), tradeId, ex.getMessage(), ex);
                                try {
                                        self.forceReleaseStuckParticipation(p.getParticipationId());
                                        released = true;
                                } catch (Exception ex2) {
                                        failed++;
                                        log.error("Force-release also failed for participation {}: {}",
                                                        p.getParticipationId(), ex2.getMessage(), ex2);
                                }
                        }

                        // Step 2 (BEST-EFFORT, own committed transaction): settlement record, HT,
                        // wallet balance, hospital pool entry burn, withdrawal processing. If any
                        // of this throws it ONLY rolls back its own bookkeeping — the asset is
                        // already back in Pool 1 from step 1.
                        if (released) {
                                try {
                                        self.recordParticipationSettlement(tradeId, p.getParticipationId(), share, originalAtSnapshot);
                                        succeeded++;
                                } catch (Exception ex) {
                                        log.warn("Side-effects failed for participation {} of trade {} (asset is in Pool 1): {}",
                                                        p.getParticipationId(), tradeId, ex.getMessage(), ex);
                                        succeeded++;
                                }
                        }
                }

                // Defensive cleanup: any participation still ACTIVE means the proportional settle
                // threw above. We can't redo the math safely, but we MUST unstick the asset so it
                // doesn't sit forever in Pool 2 (UNAVAILABLE). Force-flip the assignment back to
                // WITH_PATIENT and mark the participation SETTLED — without changing AT amounts.
                List<TradeParticipation> stillActive = tradeParticipationRepository
                                .findActiveParticipationsByTradeId(tradeId);
                for (TradeParticipation p : stillActive) {
                        try {
                                self.forceReleaseStuckParticipation(p.getParticipationId());
                                log.warn("Force-released stuck participation {} of trade {} (assignment returned to Pool 1 without P/L applied)",
                                                p.getParticipationId(), tradeId);
                        } catch (Exception ex) {
                                log.error("Force-release failed for participation {} of trade {}: {}",
                                                p.getParticipationId(), tradeId, ex.getMessage(), ex);
                        }
                }

                log.info("Trade {} settlement: {} succeeded, {} failed, {} force-released (out of {} participations)",
                                tradeId, succeeded, failed, stillActive.size(), participations.size());
                return null;
        }

        /**
         * Last-resort recovery: an ACTIVE participation whose proportional settlement failed.
         * Marks it SETTLED and flips its assignment back to WITH_PATIENT so the asset is no
         * longer stuck in Pool 2. AT amounts are NOT changed — the patient gets back exactly
         * what was locked. Use only when {@link #releaseParticipationToPool1} threw.
         */
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void forceReleaseStuckParticipation(UUID participationId) {
                TradeParticipation participation = tradeParticipationRepository.findById(participationId)
                                .orElseThrow(() -> new RuntimeException("Participation not found: " + participationId));

                if (participation.getParticipationStatus() != TradeParticipation.ParticipationStatus.ACTIVE) {
                        return;
                }

                BigDecimal lockedAt = participation.getAtAllocated() == null
                                ? BigDecimal.ZERO : participation.getAtAllocated();

                participation.setParticipationStatus(TradeParticipation.ParticipationStatus.SETTLED);
                participation.setTradeEndTime(LocalDateTime.now());
                tradeParticipationRepository.save(participation);

                if (participation.getAssignmentId() == null) {
                        return;
                }
                patientAtAssignmentRepository.findById(participation.getAssignmentId()).ifPresent(assignment -> {
                        BigDecimal currUnavailable = assignment.getUnavailableAt() == null
                                        ? BigDecimal.ZERO : assignment.getUnavailableAt();
                        BigDecimal currAvailable = assignment.getAvailableAt() == null
                                        ? BigDecimal.ZERO : assignment.getAvailableAt();
                        // Move the locked AT from unavailable → available without applying any P/L,
                        // then return the asset to Pool 1.
                        assignment.setUnavailableAt(currUnavailable.subtract(lockedAt).max(BigDecimal.ZERO));
                        assignment.setAvailableAt(currAvailable.add(lockedAt));
                        assignment.setAvailabilityStatus(PatientAtAssignment.AvailabilityStatus.WITH_PATIENT);
                        patientAtAssignmentRepository.save(assignment);
                });
        }

        /**
         * STEP 1 (CRITICAL): Move the patient's AT back to Pool 1 with the loss applied,
         * and mark the participation SETTLED. Runs in its own committed transaction so a
         * failure later (settlement record, HT, wallet) cannot undo this.
         *
         * After this method commits, the patient's asset is OUT of Pool 2 — which is the
         * single most important invariant for a multi-user trade close.
         *
         * Caller must use the proxied {@code self} reference for REQUIRES_NEW to take effect.
         */
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void releaseParticipationToPool1(UUID participationId, BigDecimal participationProfitLoss) {
                TradeParticipation participation = tradeParticipationRepository.findById(participationId)
                                .orElseThrow(() -> new RuntimeException("Participation not found: " + participationId));

                if (participation.getParticipationStatus() != TradeParticipation.ParticipationStatus.ACTIVE) {
                        log.info("Participation {} already settled, skipping release", participationId);
                        return;
                }

                BigDecimal originalAt = participation.getAtAllocated() == null
                                ? BigDecimal.ZERO : participation.getAtAllocated();
                BigDecimal originalValuePkr = participation.getAtMonetaryValuePkr() == null
                                ? BigDecimal.ZERO : participation.getAtMonetaryValuePkr();

                BigDecimal adjustedAt;
                if (participationProfitLoss.compareTo(BigDecimal.ZERO) < 0
                                && originalValuePkr.compareTo(BigDecimal.ZERO) > 0) {
                        // Loss: scale AT down by (1 + profitRatio). adjustedAt = originalAt × (close/start).
                        BigDecimal profitRatio = participationProfitLoss.divide(originalValuePkr, 8, RoundingMode.HALF_UP);
                        adjustedAt = originalAt.add(originalAt.multiply(profitRatio))
                                        .setScale(SCALE, RoundingMode.HALF_UP);
                        if (adjustedAt.compareTo(BigDecimal.ZERO) < 0) adjustedAt = BigDecimal.ZERO;
                } else {
                        // Profit / break-even: AT unchanged. Profit is handled as HT separately.
                        adjustedAt = originalAt;
                }
                BigDecimal atDelta = adjustedAt.subtract(originalAt);

                // Flip assignment back to Pool 1 with the post-loss AT.
                PatientAtAssignment assignment = patientAtAssignmentRepository.findById(participation.getAssignmentId())
                                .orElseThrow(() -> new RuntimeException("Assignment not found: " + participation.getAssignmentId()));
                BigDecimal currUnavailable = assignment.getUnavailableAt() == null
                                ? BigDecimal.ZERO : assignment.getUnavailableAt();
                BigDecimal currTotal = assignment.getTotalAtAssigned() == null
                                ? BigDecimal.ZERO : assignment.getTotalAtAssigned();
                BigDecimal currAvailable = assignment.getAvailableAt() == null
                                ? BigDecimal.ZERO : assignment.getAvailableAt();
                assignment.setUnavailableAt(currUnavailable.subtract(originalAt).max(BigDecimal.ZERO));
                assignment.setTotalAtAssigned(currTotal.subtract(originalAt).add(adjustedAt).max(BigDecimal.ZERO));
                assignment.setAvailableAt(currAvailable.add(adjustedAt));
                assignment.setAvailabilityStatus(PatientAtAssignment.AvailabilityStatus.WITH_PATIENT);
                patientAtAssignmentRepository.save(assignment);

                // Mark participation SETTLED. On loss, shrink atAllocated to the post-loss amount
                // so downstream views show what actually came back, not the pre-loss allocation.
                participation.setParticipationStatus(TradeParticipation.ParticipationStatus.SETTLED);
                participation.setTradeEndTime(LocalDateTime.now());
                if (atDelta.signum() < 0) {
                        participation.setAtAllocated(adjustedAt);
                        participation.setAtMonetaryValuePkr(
                                        adjustedAt.multiply(tokenPriceService.getAtPricePkr())
                                                        .setScale(SCALE, RoundingMode.HALF_UP));
                }
                tradeParticipationRepository.save(participation);

                log.info("Released participation {} to Pool 1: original={} AT, adjusted={} AT (delta={})",
                                participationId, originalAt, adjustedAt, atDelta);
        }

        /**
         * STEP 2 (BEST-EFFORT): Bookkeeping after the asset is already back in Pool 1.
         * Records the settlement, updates wallet balance, burns the hospital pool entry,
         * processes pending withdrawals. Each side-effect is wrapped — a failure of one
         * MUST NOT prevent the others from running, because the asset return is already
         * committed by {@link #releaseParticipationToPool1}.
         */
        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public TradeAtSettlement recordParticipationSettlement(UUID tradeId, UUID participationId,
                        BigDecimal participationProfitLoss, BigDecimal originalAtBeforeRelease) {
                TradeParticipation participation = tradeParticipationRepository.findById(participationId)
                                .orElseThrow(() -> new RuntimeException("Participation not found: " + participationId));

                BigDecimal currentAt = participation.getAtAllocated() == null
                                ? BigDecimal.ZERO : participation.getAtAllocated();

                // The pre-release allocation is supplied by the caller (settleTrade captured it
                // before releaseParticipationToPool1 shrunk participation.atAllocated). Falling
                // back to currentAt keeps callers without the snapshot working — but the
                // settlement record's "before" P/L will then read as zero.
                BigDecimal originalAt = originalAtBeforeRelease == null
                                ? currentAt : originalAtBeforeRelease;

                BigDecimal atPrice = tokenPriceService.getAtPricePkr();
                BigDecimal originalValuePkr = originalAt.multiply(atPrice).setScale(SCALE, RoundingMode.HALF_UP);
                BigDecimal profitPercentage = originalValuePkr.compareTo(BigDecimal.ZERO) > 0
                                ? participationProfitLoss.divide(originalValuePkr, SCALE, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                BigDecimal profitHtIssued = calculateProfitHt(participationProfitLoss);

                BigDecimal totalMonthlyHt = monthlyHtDistributionRepository
                                .findByParticipationId(participationId).stream()
                                .map(MonthlyHtDistribution::getCalculatedHtAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                TradeAtSettlement savedSettlement = null;
                try {
                        TradeAtSettlement settlement = TradeAtSettlement.builder()
                                        .tradeId(tradeId)
                                        .participationId(participationId)
                                        .patientId(participation.getPatientId())
                                        .originalAtAllocated(originalAt)
                                        .tradeProfitLoss(participationProfitLoss)
                                        .atReturnedAvailable(currentAt)
                                        .profitPercentage(profitPercentage)
                                        .profitHtIssued(profitHtIssued)
                                        .totalMonthlyHtIssued(totalMonthlyHt)
                                        .tradeEndTime(LocalDateTime.now())
                                        .settledAt(LocalDateTime.now())
                                        .build();
                        savedSettlement = tradeAtSettlementRepository.save(settlement);
                } catch (Exception ex) {
                        log.warn("Settlement record save failed for participation {}: {}",
                                        participationId, ex.getMessage());
                }

                // atDelta = currentAt - originalAt (≤ 0 on loss, 0 on profit/break-even).
                final BigDecimal atDeltaFinal = currentAt.subtract(originalAt);

                try {
                        patientTokenBalanceRepository.findByPatientId(participation.getPatientId()).ifPresent(b -> {
                                BigDecimal current = b.getTotalAt() == null ? BigDecimal.ZERO : b.getTotalAt();
                                b.setTotalAt(current.add(atDeltaFinal).max(BigDecimal.ZERO));
                                b.setLastUpdated(LocalDateTime.now());
                                patientTokenBalanceRepository.save(b);
                        });
                } catch (Exception ex) {
                        log.warn("Token balance update failed for participation {}: {}",
                                        participationId, ex.getMessage());
                }

                try {
                        UUID hospitalId = patientAtAssignmentRepository.findById(participation.getAssignmentId())
                                        .map(PatientAtAssignment::getHospitalId).orElse(null);
                        if (hospitalId != null) {
                                hospitalAtPoolEntryRepository
                                                .findByHospitalIdAndPatientIdAndAssetId(
                                                                hospitalId,
                                                                participation.getPatientId(),
                                                                participation.getAssetId())
                                                .ifPresent(entry -> {
                                                        BigDecimal avail = entry.getAvailableAt() == null ? BigDecimal.ZERO : entry.getAvailableAt();
                                                        BigDecimal toBurn = avail.min(currentAt);
                                                        entry.setAvailableAt(avail.subtract(toBurn));
                                                        entry.setTotalAtBurned(
                                                                        (entry.getTotalAtBurned() == null ? BigDecimal.ZERO : entry.getTotalAtBurned())
                                                                                        .add(toBurn));
                                                        entry.setActive(entry.getAvailableAt().compareTo(BigDecimal.ZERO) > 0);
                                                        entry.setUpdatedAt(LocalDateTime.now());
                                                        hospitalAtPoolEntryRepository.save(entry);
                                                });
                        }
                } catch (Exception ex) {
                        log.warn("Hospital pool entry burn failed for participation {}: {}",
                                        participationId, ex.getMessage());
                }

                try {
                        processPendingWithdrawals(tradeId, participation.getPatientId());
                } catch (Exception ex) {
                        log.warn("Pending withdrawals processing failed for trade {} patient {}: {}",
                                        tradeId, participation.getPatientId(), ex.getMessage());
                }

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
                                                        .tradingOptOut(Boolean.TRUE.equals(assignment.getTradingOptOut()))
                                                        .monetaryValuePkr(assignment.getTotalAtAssigned()
                                                                        .multiply(tokenPriceService.getAtPricePkr()))
                                                        .availableMonetaryValuePkr(
                                                                        assignment.getAvailableAt().multiply(tokenPriceService.getAtPricePkr()))
                                                        .unavailableMonetaryValuePkr(assignment.getTotalAtAssigned().subtract(assignment.getAvailableAt())
                                                                        .multiply(tokenPriceService.getAtPricePkr()))
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
                                        BigDecimal expectedAt = deposit.getAssetValue() != null
                                                        ? deposit.getAssetValue().divide(tokenPriceService.getAtPricePkr(), 2,
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
                                                        .monetaryValuePkr(expectedAt.multiply(tokenPriceService.getAtPricePkr()))
                                                        .availableMonetaryValuePkr(BigDecimal.ZERO)
                                                        .unavailableMonetaryValuePkr(expectedAt.multiply(tokenPriceService.getAtPricePkr()))
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
