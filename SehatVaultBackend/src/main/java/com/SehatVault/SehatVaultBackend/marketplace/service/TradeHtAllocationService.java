package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.blockchain.model.BlockchainTxRef;
import com.SehatVault.SehatVaultBackend.blockchain.service.TokenContractGateway;
import com.SehatVault.SehatVaultBackend.blockchain.util.TokenUnitConverter;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import com.SehatVault.SehatVaultBackend.marketplace.entity.TradeParticipation;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
import com.SehatVault.SehatVaultBackend.marketplace.repository.TradeParticipationRepository;
import com.SehatVault.SehatVaultBackend.notification.service.NotificationService;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.subscription.entity.SubscriptionPlan;
import com.SehatVault.SehatVaultBackend.subscription.repository.SubscriptionPlanRepository;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

/**
 * Credits monthly HT to patients whose AT is currently locked in an ACTIVE trade.
 * The monthly amount mirrors the cheapest active subscription plan ("basic" tier)
 * configured for the trade's hospital. Allocation stops automatically when the
 * trade closes (participation becomes SETTLED) or the patient withdraws.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TradeHtAllocationService {

    private final TradeParticipationRepository tradeParticipationRepository;
    private final MarketplaceTradeRepository marketplaceTradeRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final HealthCardRepository healthCardRepository;
    private final CardRepository cardRepository;
    private final TokenContractGateway tokenContractGateway;
    private final NotificationService notificationService;

    @Transactional
    public int processDueAllocations() {
        List<TradeParticipation> active = tradeParticipationRepository
                .findByParticipationStatus(TradeParticipation.ParticipationStatus.ACTIVE);
        if (active.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        Map<UUID, SubscriptionPlan> basicPlanByHospital = new HashMap<>();
        int totalAllocations = 0;

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId == null) {
            log.warn("HT token not configured in tokens table; skipping trade HT allocation run");
            return 0;
        }

        for (TradeParticipation participation : active) {
            try {
                int credited = processParticipation(participation, today, basicPlanByHospital, htTokenId);
                totalAllocations += credited;
            } catch (Exception ex) {
                log.error("Failed processing trade HT allocation for participation {}: {}",
                        participation.getParticipationId(), ex.getMessage(), ex);
            }
        }

        return totalAllocations;
    }

    private int processParticipation(TradeParticipation participation,
                                     LocalDate today,
                                     Map<UUID, SubscriptionPlan> basicPlanByHospital,
                                     UUID htTokenId) {
        MarketplaceTrade trade = marketplaceTradeRepository.findById(participation.getTradeId()).orElse(null);
        if (trade == null || trade.getHospitalId() == null) {
            return 0;
        }

        SubscriptionPlan basicPlan = basicPlanByHospital.computeIfAbsent(
                trade.getHospitalId(), this::findBasicPlanForHospital);
        if (basicPlan == null || basicPlan.getMonthlyHt() == null || basicPlan.getMonthlyHt() <= 0) {
            return 0;
        }

        BigDecimal planPrice = nz(basicPlan.getAmountPerMonth());
        BigDecimal assetValue = nz(participation.getAtMonetaryValuePkr());
        if (planPrice.compareTo(BigDecimal.ZERO) > 0 && assetValue.compareTo(planPrice) < 0) {
            // Asset value below the basic plan threshold — not eligible.
            return 0;
        }

        Patient patient = patientRepository.findById(participation.getPatientId()).orElse(null);
        if (patient == null) {
            return 0;
        }
        String walletAddress = patient.getWalletAddress();
        if (walletAddress == null || walletAddress.isBlank()) {
            log.debug("Skipping participation {} — patient has no wallet address", participation.getParticipationId());
            return 0;
        }

        LocalDate nextDue = participation.getNextHtAllocationAt();
        if (nextDue == null) {
            nextDue = participation.getTradeStartTime() != null
                    ? participation.getTradeStartTime().toLocalDate().plusMonths(1)
                    : today.plusMonths(1);
        }

        BigDecimal monthlyHt = BigDecimal.valueOf(basicPlan.getMonthlyHt());
        int credited = 0;
        while (!today.isBefore(nextDue)) {
            creditHt(participation, patient, walletAddress, monthlyHt, basicPlan, htTokenId);
            nextDue = nextDue.plusMonths(1);
            credited++;
        }

        participation.setNextHtAllocationAt(nextDue);
        tradeParticipationRepository.save(participation);
        return credited;
    }

    private void creditHt(TradeParticipation participation,
                          Patient patient,
                          String walletAddress,
                          BigDecimal htAmount,
                          SubscriptionPlan basicPlan,
                          UUID htTokenId) {
        // Update wallet HT balance.
        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                .orElseGet(() -> {
                    PatientTokenBalance fresh = new PatientTokenBalance();
                    fresh.setPatientId(patient.getId());
                    fresh.setTotalAt(BigDecimal.ZERO);
                    fresh.setTotalHt(BigDecimal.ZERO);
                    fresh.setLastUpdated(LocalDateTime.now());
                    return fresh;
                });
        balance.setTotalHt(nz(balance.getTotalHt()).add(htAmount));
        balance.setLastUpdated(LocalDateTime.now());
        patientTokenBalanceRepository.save(balance);

        // Credit the Asset Health Card so this HT is tracked alongside other asset-derived HT.
        creditAssetHealthCard(patient.getId(), htAmount);

        // Mint HT on-chain.
        BlockchainTxRef chainTx = tokenContractGateway.mintHT(
                walletAddress,
                TokenUnitConverter.toBaseUnits(htAmount, 18));

        // Record wallet transaction (history).
        Transaction tx = new Transaction();
        tx.setUserId(patient.getUserId());
        tx.setTokenId(htTokenId);
        tx.setType(Transaction.TransactionType.HT_MINT);
        tx.setAmount(htAmount);
        tx.setDescription(String.format(
                "Trade-lock monthly HT (%s) for participation %s",
                basicPlan.getSubscriptionName(),
                participation.getParticipationId()));
        tx.setSenderWalletAddress("TRADE_LOCK_BONUS");
        tx.setReceiverWalletAddress(walletAddress);
        tx.setTransactionHash(chainTx.getTransactionHash());
        tx.setBlockNumber(chainTx.getBlockNumber());
        tx.setStatus("CONFIRMED");
        tx.setTimestamp(LocalDateTime.now());
        walletTransactionRepository.save(tx);

        // Activity log.
        ActivityLog activity = new ActivityLog();
        activity.setUserId(patient.getUserId());
        activity.setActivityName("Trade Lock Monthly HT");
        activity.setDescription(String.format(
                "%s HT credited while AT locked in trade %s (Participation %s)",
                htAmount.toPlainString(),
                participation.getTradeId(),
                participation.getParticipationId()));
        activity.setType(ActivityLog.ActivityType.ACTION);
        activity.setStatus("SUCCESS");
        activity.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(activity);

        // Notify the patient.
        notificationService.notifyUser(
                patient.getUserId(),
                patient.getUserId(),
                "Monthly HT credited",
                htAmount.toPlainString() + " HT credited while your asset is locked in an active trade.");
    }

    private SubscriptionPlan findBasicPlanForHospital(UUID hospitalId) {
        return subscriptionPlanRepository.findByHospitalId(hospitalId).stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .filter(p -> p.getMonthlyHt() != null && p.getMonthlyHt() > 0)
                .filter(p -> p.getAmountPerMonth() != null)
                .min(Comparator.comparing(SubscriptionPlan::getAmountPerMonth))
                .orElse(null);
    }

    private void creditAssetHealthCard(UUID patientId, BigDecimal htCredit) {
        if (htCredit == null || htCredit.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        Card card = cardRepository.findByCardNameIgnoreCase("Asset Health Card").orElseGet(() -> {
            Card c = new Card();
            c.setCardName("Asset Health Card");
            return cardRepository.save(c);
        });

        Optional<HealthCard> existing = healthCardRepository.findByPatientIdAndCardId(patientId, card.getCardId())
                .stream()
                .findFirst();

        HealthCard hc = existing.orElseGet(() -> {
            HealthCard created = new HealthCard();
            created.setPatientId(patientId);
            created.setCardId(card.getCardId());
            created.setCardNum(generateCardNum());
            created.setHtBalance(BigDecimal.ZERO);
            created.setExpiryDate(LocalDate.now().plusYears(3));
            created.setCvv(String.format("%03d", new Random().nextInt(1000)));
            return healthCardRepository.save(created);
        });

        hc.setHtBalance(nz(hc.getHtBalance()).add(htCredit));
        healthCardRepository.save(hc);
    }

    private String generateCardNum() {
        String num = String.format("%016d", System.currentTimeMillis() % 10000000000000000L);
        return healthCardRepository.existsByCardNum(num) ? generateCardNum() : num;
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
