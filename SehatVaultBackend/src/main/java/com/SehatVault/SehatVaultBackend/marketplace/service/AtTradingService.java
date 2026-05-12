package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.blockchain.model.BlockchainTxRef;
import com.SehatVault.SehatVaultBackend.blockchain.service.TokenContractGateway;
import com.SehatVault.SehatVaultBackend.blockchain.util.TokenUnitConverter;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.marketplace.dto.PatientAssetTokenDto;
import com.SehatVault.SehatVaultBackend.marketplace.entity.*;
import com.SehatVault.SehatVaultBackend.marketplace.repository.*;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import com.SehatVault.SehatVaultBackend.wallet.service.TokenPriceService;
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
        private PatientRepository patientRepository;

        @Autowired
        private WalletTransactionRepository walletTransactionRepository;

        @Autowired
        private CardRepository cardRepository;

        @Autowired
        private HealthCardRepository healthCardRepository;

        @Autowired
        private TokenContractGateway tokenContractGateway;

        @Autowired
        private HospitalAtPoolEntryRepository hospitalAtPoolEntryRepository;

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

                // Remove the allocated AT from the hospital trading pool immediately.
                // The trade consumes Pool 2 capacity as soon as it starts, so the pool
                // must reflect the reduced availability right away.
                hospitalAtPoolEntryRepository
                                .findByHospitalIdAndPatientIdAndAssetId(
                                                assignment.getHospitalId(),
                                                patientId,
                                                assetId)
                                .ifPresent(entry -> {
                                        BigDecimal available = entry.getAvailableAt() == null
                                                        ? BigDecimal.ZERO
                                                        : entry.getAvailableAt();
                                        BigDecimal remaining = available.subtract(atToAllocate);
                                        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                                                remaining = BigDecimal.ZERO;
                                        }
                                        entry.setAvailableAt(remaining);
                                        entry.setActive(remaining.compareTo(BigDecimal.ZERO) > 0);
                                        entry.setUpdatedAt(LocalDateTime.now());
                                        hospitalAtPoolEntryRepository.save(entry);
                                });

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

                Patient patient = patientRepository.findById(distribution.getPatientId())
                                .orElseThrow(() -> new RuntimeException("Patient not found"));
                if (patient.getWalletAddress() == null || patient.getWalletAddress().isBlank()) {
                        throw new RuntimeException("Patient wallet address is missing; cannot distribute HT on-chain");
                }

                BigDecimal htAmount = distribution.getCalculatedHtAmount() == null
                                ? BigDecimal.ZERO
                                : distribution.getCalculatedHtAmount().setScale(SCALE, RoundingMode.HALF_UP);
                if (htAmount.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new RuntimeException("Calculated HT amount must be > 0");
                }

                BlockchainTxRef chainTx = tokenContractGateway.mintHT(
                                patient.getWalletAddress(),
                                TokenUnitConverter.toBaseUnits(htAmount, 18)
                );

                // Update wallet balance (off-chain view)
                com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance balance = patientTokenBalanceRepository
                                .findByPatientId(patient.getId())
                                .orElseGet(() -> {
                                        com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance b = new com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance();
                                        b.setPatientId(patient.getId());
                                        b.setTotalAt(BigDecimal.ZERO);
                                        b.setTotalHt(BigDecimal.ZERO);
                                        b.setLastUpdated(LocalDateTime.now());
                                        return b;
                                });
                balance.setTotalHt((balance.getTotalHt() == null ? BigDecimal.ZERO : balance.getTotalHt()).add(htAmount));
                balance.setLastUpdated(LocalDateTime.now());
                patientTokenBalanceRepository.save(balance);

                // Credit Asset Health Card bucket (keeps hospital redemption source consistent)
                HealthCard assetCard = getOrCreateHealthCard(patient.getId(), "Asset Health Card");
                assetCard.setHtBalance((assetCard.getHtBalance() == null ? BigDecimal.ZERO : assetCard.getHtBalance()).add(htAmount));
                healthCardRepository.save(assetCard);

                // Persist transaction row for UI visibility
                UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
                if (htTokenId != null) {
                        Transaction tx = new Transaction();
                        tx.setUserId(patient.getUserId());
                        tx.setTokenId(htTokenId);
                        tx.setType(Transaction.TransactionType.CREDIT);
                        tx.setAmount(htAmount);
                        tx.setDescription("Monthly HT distribution for trade " + distribution.getTradeId()
                                        + " (month " + distribution.getDistributionMonth() + ")");
                        tx.setSenderWalletAddress("TRADING_SYSTEM");
                        tx.setReceiverWalletAddress(patient.getWalletAddress());
                        tx.setTransactionHash(chainTx.getTransactionHash());
                        tx.setBlockNumber(chainTx.getBlockNumber());
                        tx.setStatus("CONFIRMED");
                        tx.setTimestamp(LocalDateTime.now());
                        walletTransactionRepository.save(tx);
                }

                distribution.markAsDistributed();
                monthlyHtDistributionRepository.save(distribution);

                log.info("Monthly HT {} distributed to patient {}", htAmount, distribution.getPatientId());
        }

        private HealthCard getOrCreateHealthCard(UUID patientId, String cardName) {
                Card card = cardRepository.findByCardNameIgnoreCase(cardName)
                                .orElseThrow(() -> new IllegalStateException("Card type not found: " + cardName));

                return healthCardRepository.findByPatientIdAndCardId(patientId, card.getCardId())
                                .stream()
                                .findFirst()
                                .orElseGet(() -> {
                                        HealthCard hc = new HealthCard();
                                        hc.setPatientId(patientId);
                                        hc.setCardId(card.getCardId());
                                        hc.setCardNum("HC-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
                                        hc.setHtBalance(BigDecimal.ZERO.setScale(SCALE, RoundingMode.HALF_UP));
                                        hc.setExpiryDate(LocalDate.now().plusYears(3));
                                        hc.setCvv(String.valueOf(100 + new java.util.Random().nextInt(900)));
                                        return healthCardRepository.save(hc);
                                });
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
        // REQUIRES_NEW so a settlement failure can't poison an outer transaction (e.g. closeTrade).
        @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
        public TradeAtSettlement settleTrade(UUID tradeId, BigDecimal profitLoss) {
                log.info("Settling trade {} with profit/loss {}", tradeId, profitLoss);

                List<TradeParticipation> participations = tradeParticipationRepository
                                .findActiveParticipationsByTradeId(tradeId);

                if (participations.isEmpty()) {
                        log.info("No active participations found for trade {} - skipping settlement", tradeId);
                        return null;
                }

                // Total AT locked across all participants — used to share P/L proportionally.
                BigDecimal totalAllocatedAt = participations.stream()
                                .map(TradeParticipation::getAtAllocated)
                                .map(v -> v == null ? BigDecimal.ZERO : v)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal pl = profitLoss == null ? BigDecimal.ZERO : profitLoss;

                for (TradeParticipation participation : participations) {
                        settleTradeParticipation(tradeId, participation, pl, totalAllocatedAt);
                }

                log.info("Trade {} settlement completed", tradeId);
                return null;
        }

        /**
         * Settle individual trade participation
         */
        @Transactional
        private TradeAtSettlement settleTradeParticipation(UUID tradeId, TradeParticipation participation,
                        BigDecimal profitLoss, BigDecimal totalAllocatedAt) {
                log.info("Settling participation {} for patient {}", participation.getParticipationId(),
                                participation.getPatientId());

                List<MonthlyHtDistribution> monthlyDistributions = monthlyHtDistributionRepository
                                .findByParticipationId(participation.getParticipationId());

                BigDecimal totalMonthlyHt = monthlyDistributions.stream()
                                .map(MonthlyHtDistribution::getCalculatedHtAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Proportional P/L = total profitLoss × (this participant's AT / total AT in trade).
                // Guards against divide-by-zero when totalAllocatedAt is 0 (no participants funded).
                BigDecimal participationProfitLoss;
                if (totalAllocatedAt == null || totalAllocatedAt.compareTo(BigDecimal.ZERO) <= 0) {
                        participationProfitLoss = BigDecimal.ZERO;
                } else {
                        participationProfitLoss = profitLoss
                                        .multiply(participation.getAtAllocated())
                                        .divide(totalAllocatedAt, SCALE, RoundingMode.HALF_UP);
                }

                BigDecimal profitHtIssued = calculateProfitHt(participationProfitLoss);

                // Profit percentage relative to this participant's monetary value, guarded against zero.
                BigDecimal monetaryValue = participation.getAtMonetaryValuePkr() == null
                                ? BigDecimal.ZERO : participation.getAtMonetaryValuePkr();
                BigDecimal profitPercentage = monetaryValue.compareTo(BigDecimal.ZERO) > 0
                                ? participationProfitLoss.divide(monetaryValue, SCALE, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                // Settlement rules (per spec):
                //   • Loss  → AT shrinks proportionally; the reduced amount returns to Pool 1.
                //   • Profit → AT returns to Pool 1 unchanged. Profit value is captured by
                //     ProfitAllocationService.calculateAvailableProfit and the hospital admin
                //     distributes it to participants as HT via the Profit Allocation page.
                PatientAtAssignment assignment = patientAtAssignmentRepository.findById(participation.getAssignmentId())
                                .orElseThrow(() -> new RuntimeException("Assignment not found"));

                BigDecimal originalAt = participation.getAtAllocated();
                BigDecimal originalValuePkr = participation.getAtMonetaryValuePkr();
                BigDecimal adjustedAt;
                BigDecimal profitRatio;
                if (participationProfitLoss.compareTo(BigDecimal.ZERO) < 0) {
                        // Loss — AT returned scales with the trade's closing value:
                        //   adjustedAt = originalAt × (close PKR / start PKR)
                        // Equivalent to (originalValuePkr + participationProfitLoss) / atPrice.
                        profitRatio = originalValuePkr.compareTo(BigDecimal.ZERO) > 0
                                        ? participationProfitLoss.divide(originalValuePkr, 8, RoundingMode.HALF_UP)
                                        : BigDecimal.ZERO;
                        adjustedAt = originalAt.add(originalAt.multiply(profitRatio))
                                        .setScale(2, RoundingMode.HALF_UP);
                        if (adjustedAt.compareTo(BigDecimal.ZERO) < 0) adjustedAt = BigDecimal.ZERO;
                } else {
                        // Break-even or profit — AT unchanged. Profit handled separately as HT.
                        profitRatio = BigDecimal.ZERO;
                        adjustedAt = originalAt;
                }
                BigDecimal atDelta = adjustedAt.subtract(originalAt); // <= 0 on loss, 0 otherwise

                TradeAtSettlement settlement = TradeAtSettlement.builder()
                                .tradeId(tradeId)
                                .participationId(participation.getParticipationId())
                                .patientId(participation.getPatientId())
                                .originalAtAllocated(originalAt)
                                .tradeProfitLoss(participationProfitLoss)
                                .atReturnedAvailable(adjustedAt)
                                .profitPercentage(profitPercentage)
                                .profitHtIssued(profitHtIssued)
                                .totalMonthlyHtIssued(totalMonthlyHt)
                                .tradeEndTime(LocalDateTime.now())
                                .settledAt(LocalDateTime.now())
                                .build();

                TradeAtSettlement savedSettlement = tradeAtSettlementRepository.save(settlement);

                // Update participation status. On loss, also shrink atAllocated to the
                // post-settlement amount so downstream views (history, dashboards) reflect
                // what actually came back rather than the pre-loss allocation.
                participation.setParticipationStatus(TradeParticipation.ParticipationStatus.SETTLED);
                participation.setTradeEndTime(LocalDateTime.now());
                if (atDelta.signum() < 0) {
                        participation.setAtAllocated(adjustedAt);
                        participation.setAtMonetaryValuePkr(
                                        adjustedAt.multiply(tokenPriceService.getAtPricePkr())
                                                        .setScale(SCALE, RoundingMode.HALF_UP));
                }
                tradeParticipationRepository.save(participation);

                // Subtract the original locked AT, then add back the adjusted AT into Pool 1.
                assignment.setUnavailableAt(assignment.getUnavailableAt().subtract(originalAt));
                assignment.setTotalAtAssigned(assignment.getTotalAtAssigned().subtract(originalAt).add(adjustedAt));
                assignment.setAvailableAt(assignment.getAvailableAt().add(adjustedAt));
                assignment.setAvailabilityStatus(PatientAtAssignment.AvailabilityStatus.WITH_PATIENT);
                patientAtAssignmentRepository.save(assignment);

                // Update wallet total AT to match the new total assigned.
                patientTokenBalanceRepository.findByPatientId(participation.getPatientId()).ifPresent(b -> {
                        BigDecimal current = b.getTotalAt() == null ? BigDecimal.ZERO : b.getTotalAt();
                        b.setTotalAt(current.add(atDelta).max(BigDecimal.ZERO));
                        b.setLastUpdated(LocalDateTime.now());
                        patientTokenBalanceRepository.save(b);
                });

                // Mirror the AT shrink on-chain: a loss reduces the patient's AT off-chain,
                // so the same amount is burned from the patient wallet on-chain to keep
                // the on-chain balance consistent with the off-chain ledger.
                if (atDelta.signum() < 0) {
                        BigDecimal burnAmount = atDelta.abs();
                        patientRepository.findById(participation.getPatientId()).ifPresent(p -> {
                                if (p.getWalletAddress() == null || p.getWalletAddress().isBlank()) {
                                        log.warn("Skipping on-chain AT burn for patient {} — wallet address missing", p.getId());
                                        return;
                                }
                                try {
                                        BlockchainTxRef burnRef = tokenContractGateway.burnAT(
                                                        p.getWalletAddress(),
                                                        TokenUnitConverter.toBaseUnits(burnAmount, 18)
                                        );
                                        log.info("Burned {} AT on-chain for patient {} after trade {} loss (tx={}, block={})",
                                                        burnAmount, p.getId(), tradeId,
                                                        burnRef.getTransactionHash(), burnRef.getBlockNumber());

                                        UUID atTokenId = walletTransactionRepository.findTokenIdBySymbol("AT");
                                        if (atTokenId != null) {
                                                Transaction burnTx = new Transaction();
                                                burnTx.setUserId(p.getUserId());
                                                burnTx.setTokenId(atTokenId);
                                                burnTx.setType(Transaction.TransactionType.AT_BURN);
                                                burnTx.setAmount(burnAmount);
                                                burnTx.setDescription("AT burned after loss on trade " + tradeId);
                                                burnTx.setSenderWalletAddress(p.getWalletAddress());
                                                burnTx.setReceiverWalletAddress("TRADE_LOSS_BURN");
                                                burnTx.setTransactionHash(burnRef.getTransactionHash());
                                                burnTx.setBlockNumber(burnRef.getBlockNumber());
                                                burnTx.setStatus("CONFIRMED");
                                                burnTx.setTimestamp(LocalDateTime.now());
                                                walletTransactionRepository.save(burnTx);
                                        }
                                } catch (Exception ex) {
                                        log.warn("On-chain AT burn failed for trade {} patient {}: {}",
                                                        tradeId, p.getId(), ex.getMessage());
                                }
                        });
                }

                log.info("Settled participation {}: original={} AT, profitRatio={}, adjusted={} AT (delta={}), returned to Pool 1",
                                participation.getParticipationId(), originalAt, profitRatio, adjustedAt, atDelta);

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
