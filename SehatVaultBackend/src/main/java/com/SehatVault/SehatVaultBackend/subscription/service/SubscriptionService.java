package com.SehatVault.SehatVaultBackend.subscription.service;

import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.patient.service.PatientWalletAllocatorService;
import com.SehatVault.SehatVaultBackend.wallet.service.TokenPriceService;
import com.SehatVault.SehatVaultBackend.subscription.dto.*;
import com.SehatVault.SehatVaultBackend.subscription.entity.PatientSubscription;
import com.SehatVault.SehatVaultBackend.subscription.entity.PaymentHistory;
import com.SehatVault.SehatVaultBackend.subscription.entity.SubscriptionPlan;
import com.SehatVault.SehatVaultBackend.subscription.repository.PatientSubscriptionRepository;
import com.SehatVault.SehatVaultBackend.subscription.repository.PaymentHistoryRepository;
import com.SehatVault.SehatVaultBackend.subscription.repository.SubscriptionPlanRepository;
import com.SehatVault.SehatVaultBackend.notification.service.NotificationService;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for subscription management
 */
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private static final BigDecimal THOUSAND_PKR = new BigDecimal("1000");
    private static final BigDecimal HT_PER_THOUSAND_PKR = new BigDecimal("10");

    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PatientSubscriptionRepository patientSubscriptionRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final PatientRepository patientRepository;
    private final HealthCardRepository healthCardRepository;
    private final CardRepository cardRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PatientWalletAllocatorService patientWalletAllocatorService;
    private final TokenPriceService tokenPriceService;
    private final NotificationService notificationService;

    /**
     * Get all active subscription plans
     */
    public List<SubscriptionPlanDto> getAllActivePlans() {
        List<SubscriptionPlan> plans = subscriptionPlanRepository.findByIsActiveTrue();
        return plans.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get patient's current active subscription
     */
    public PatientSubscriptionDto getPatientActiveSubscription(UUID userId) {
        // Find patient by userId
        Patient patient = patientRepository.findByUserId(userId)
                .orElse(null);

        if (patient == null) {
            return null;
        }

        // Find active subscription
        PatientSubscription subscription = patientSubscriptionRepository
                .findByPatientIdAndStatus(patient.getId(), PatientSubscription.SubscriptionStatus.ACTIVE)
                .orElse(null);

        if (subscription == null) {
            return null;
        }

        // Get plan details
        SubscriptionPlan plan = subscriptionPlanRepository
                .findById(subscription.getSubscriptionId())
                .orElse(null);

        if (plan == null) {
            return null;
        }

        return convertToSubscriptionDto(subscription, plan);
    }

    /**
     * Subscribe patient to a plan
     */
    @Transactional
    public ApiResponse<PatientSubscriptionDto> subscribePatient(SubscribeRequest request) {
        try {
            // Validate subscription plan exists
            SubscriptionPlan plan = subscriptionPlanRepository
                    .findById(request.getSubscriptionId())
                    .orElse(null);

            if (plan == null || !plan.getIsActive()) {
                return ApiResponse.error("Subscription plan not found or inactive");
            }

            // Find or create patient record
            Patient patient = patientRepository.findByUserId(request.getUserId())
                    .orElseGet(() -> {
                        Patient newPatient = new Patient();
                        newPatient.setUserId(request.getUserId());
                        newPatient.setHasSubscription(false);
                        newPatient.setHasAsset(false);
                        newPatient.setKycStatus(Patient.KycStatus.PENDING);
                        return patientRepository.save(newPatient);
                    });

            patientWalletAllocatorService.assignWalletToPatient(patient);

            // Check if patient already has an active subscription
            boolean hasActive = patientSubscriptionRepository
                    .existsByPatientIdAndStatus(patient.getId(), PatientSubscription.SubscriptionStatus.ACTIVE);

            if (hasActive) {
                return ApiResponse.error("Patient already has an active subscription");
            }

            // Create subscription
            PatientSubscription subscription = new PatientSubscription();
            subscription.setSubscriptionId(request.getSubscriptionId());
            subscription.setPatientId(patient.getId());
            subscription.setStartDate(LocalDate.now());
            subscription.setEndDate(LocalDate.now().plusMonths(1));
            subscription.setStatus(PatientSubscription.SubscriptionStatus.ACTIVE);

            subscription = patientSubscriptionRepository.save(subscription);

            // Process payment
            PaymentHistory payment = new PaymentHistory();
            payment.setPatientId(patient.getId());
            payment.setSubsId(request.getSubscriptionId());
            payment.setAmount(plan.getAmountPerMonth());
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setStatus(PaymentHistory.PaymentStatus.SUCCESS);

            paymentHistoryRepository.save(payment);

            // Update patient record
            patient.setHasSubscription(true);
            patientRepository.save(patient);

            // Auto-create Subscription Card if patient doesn't have one
            HealthCard subscriptionCard = getOrCreateSubscriptionCard(patient.getId());

            // Initial HT allocation for the first month at the time of subscription
            allocateMonthlyHt(patient, plan, subscription, subscriptionCard, "SUBSCRIPTION_INITIAL");

            notificationService.notifyUser(
                    request.getUserId(),
                    request.getUserId(),
                    "Subscription Activated",
                    "You are now subscribed to " + plan.getSubscriptionName() + ". Initial monthly HT has been credited."
            );

            PatientSubscriptionDto dto = convertToSubscriptionDto(subscription, plan);
            return ApiResponse.success("Subscription successful", dto);

        } catch (Exception e) {
            return ApiResponse.error("Subscription failed: " + e.getMessage());
        }
    }

    /**
     * Change an existing active plan.
     * Policy implemented:
     * - Plan switch happens immediately (affects next renewal allocation)
     * - If upgrading (new monthly HT > old), credit the delta immediately
     * - If downgrading, no refund; change still applies to next renewal
     */
    @Transactional
    public ApiResponse<PatientSubscriptionDto> changePlan(ChangePlanRequest request) {
        try {
            if (request == null || request.getUserId() == null || request.getNewSubscriptionId() == null) {
                return ApiResponse.error("userId and newSubscriptionId are required");
            }

            Patient patient = patientRepository.findByUserId(request.getUserId()).orElse(null);
            if (patient == null) {
                return ApiResponse.error("Patient not found");
            }

            PatientSubscription subscription = patientSubscriptionRepository
                    .findByPatientIdAndStatus(patient.getId(), PatientSubscription.SubscriptionStatus.ACTIVE)
                    .orElse(null);
            if (subscription == null) {
                return ApiResponse.error("No active subscription found");
            }

            SubscriptionPlan oldPlan = subscriptionPlanRepository.findById(subscription.getSubscriptionId()).orElse(null);
            SubscriptionPlan newPlan = subscriptionPlanRepository.findById(request.getNewSubscriptionId()).orElse(null);
            if (newPlan == null || !Boolean.TRUE.equals(newPlan.getIsActive())) {
                return ApiResponse.error("New subscription plan not found or inactive");
            }
            if (oldPlan == null) {
                return ApiResponse.error("Current subscription plan not found");
            }
            if (oldPlan.getSubsId().equals(newPlan.getSubsId())) {
                return ApiResponse.error("You are already on this plan");
            }

            patientWalletAllocatorService.assignWalletToPatient(patient);
            HealthCard subscriptionCard = getOrCreateSubscriptionCard(patient.getId());

            BigDecimal oldMonthlyHt = calculateMonthlyHt(oldPlan.getAmountPerMonth());
            BigDecimal newMonthlyHt = calculateMonthlyHt(newPlan.getAmountPerMonth());

            // Record payment for plan change (mocked as success, consistent with existing subscribe flow)
            PaymentHistory payment = new PaymentHistory();
            payment.setPatientId(patient.getId());
            payment.setSubsId(newPlan.getSubsId());
            payment.setAmount(newPlan.getAmountPerMonth());
            payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Plan Change");
            payment.setStatus(PaymentHistory.PaymentStatus.SUCCESS);
            paymentHistoryRepository.save(payment);

            // Apply upgrade delta immediately
            BigDecimal delta = newMonthlyHt.subtract(oldMonthlyHt);
            if (delta.compareTo(BigDecimal.ZERO) > 0) {
                // Credit only the difference to avoid double-crediting within the same cycle.
                creditManualHt(patient, subscriptionCard, delta, "SUBSCRIPTION_UPGRADE_DELTA");
            }

            // Switch plan for next allocations
            subscription.setSubscriptionId(newPlan.getSubsId());
            patientSubscriptionRepository.save(subscription);

            String planChangeMsg = "Your subscription plan was changed from "
                    + oldPlan.getSubscriptionName() + " to " + newPlan.getSubscriptionName() + ".";
            if (delta.compareTo(BigDecimal.ZERO) > 0) {
                planChangeMsg += " Upgrade bonus: " + delta.setScale(2, RoundingMode.HALF_UP).toPlainString() + " HT credited.";
            }
            notificationService.notifyUser(request.getUserId(), request.getUserId(), "Subscription Plan Updated", planChangeMsg);

            PatientSubscriptionDto dto = convertToSubscriptionDto(subscription, newPlan);
            return ApiResponse.success("Plan changed successfully", dto);
        } catch (Exception e) {
            return ApiResponse.error("Failed to change plan: " + e.getMessage());
        }
    }

    private void creditManualHt(Patient patient, HealthCard subscriptionCard, BigDecimal amount, String source) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) return;

        subscriptionCard.setHtBalance(nz(subscriptionCard.getHtBalance()).add(amount));
        healthCardRepository.save(subscriptionCard);

        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                .orElseGet(() -> {
                    PatientTokenBalance b = new PatientTokenBalance();
                    b.setPatientId(patient.getId());
                    b.setTotalAt(BigDecimal.ZERO);
                    b.setTotalHt(BigDecimal.ZERO);
                    b.setLastUpdated(java.time.LocalDateTime.now());
                    return b;
                });
        balance.setTotalHt(nz(balance.getTotalHt()).add(amount));
        balance.setLastUpdated(java.time.LocalDateTime.now());
        patientTokenBalanceRepository.save(balance);

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId != null) {
            Transaction tx = new Transaction();
            tx.setUserId(patient.getUserId());
            tx.setTokenId(htTokenId);
            tx.setType(Transaction.TransactionType.CREDIT);
            tx.setAmount(amount.setScale(2, RoundingMode.HALF_UP));
            tx.setDescription("Subscription HT credit (" + source + ")");
            tx.setSenderWalletAddress("SUBSCRIPTION_SYSTEM");
            tx.setReceiverWalletAddress(patient.getWalletAddress());
            tx.setTransactionHash("0x" + String.format("%064x", System.currentTimeMillis()));
            tx.setStatus("CONFIRMED");
            tx.setTimestamp(java.time.LocalDateTime.now());
            walletTransactionRepository.save(tx);
        }

        ActivityLog activity = new ActivityLog();
        activity.setUserId(patient.getUserId());
        activity.setActivityName("Subscription Plan Change");
        activity.setDescription(amount.toPlainString() + " HT credited to Subscription Card (" + source + ")");
        activity.setType(ActivityLog.ActivityType.ACTION);
        activity.setStatus("SUCCESS");
        activity.setTimestamp(java.time.LocalDateTime.now());
        activityLogRepository.save(activity);

    }

    // ─── Hospital admin plan management ───────────────────────────────────────

    public List<SubscriptionPlanDto> getHospitalPlans(UUID hospitalId) {
        return subscriptionPlanRepository.findByHospitalId(hospitalId)
                .stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public SubscriptionPlanDto createPlan(UUID hospitalId, UpsertPlanRequest request) {
        List<SubscriptionPlan> existing = subscriptionPlanRepository.findByHospitalId(hospitalId);
        long activePlans = existing.stream().filter(p -> Boolean.TRUE.equals(p.getIsActive())).count();
        if (activePlans >= 3) {
            throw new IllegalStateException("A hospital can have at most 3 active subscription plans");
        }
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setHospitalId(hospitalId);
        plan.setSubscriptionName(request.getSubscriptionName());
        plan.setAmountPerMonth(request.getAmountPerMonth());
        plan.setFeatures(String.join("|", request.getFeatures()));
        plan.setIsActive(true);
        return convertToDto(subscriptionPlanRepository.save(plan));
    }

    @Transactional
    public SubscriptionPlanDto updatePlan(UUID hospitalId, UUID subsId, UpsertPlanRequest request) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(subsId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        if (!plan.getHospitalId().equals(hospitalId)) {
            throw new IllegalArgumentException("Plan does not belong to this hospital");
        }
        plan.setSubscriptionName(request.getSubscriptionName());
        plan.setAmountPerMonth(request.getAmountPerMonth());
        plan.setFeatures(String.join("|", request.getFeatures()));
        return convertToDto(subscriptionPlanRepository.save(plan));
    }

    @Transactional
    public void deactivatePlan(UUID hospitalId, UUID subsId) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(subsId)
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        if (!plan.getHospitalId().equals(hospitalId)) {
            throw new IllegalArgumentException("Plan does not belong to this hospital");
        }
        plan.setIsActive(false);
        subscriptionPlanRepository.save(plan);
    }

    // ─── Health card helper ───────────────────────────────────────────────────

    @Transactional
    public int processMonthlySubscriptionAllocations() {
        List<PatientSubscription> activeSubscriptions = patientSubscriptionRepository
                .findByStatus(PatientSubscription.SubscriptionStatus.ACTIVE);

        int allocations = 0;
        LocalDate today = LocalDate.now();

        for (PatientSubscription subscription : activeSubscriptions) {
            Patient patient = patientRepository.findById(subscription.getPatientId()).orElse(null);
            if (patient == null) {
                continue;
            }

            patientWalletAllocatorService.assignWalletToPatient(patient);

            SubscriptionPlan plan = subscriptionPlanRepository.findById(subscription.getSubscriptionId()).orElse(null);
            if (plan == null || !Boolean.TRUE.equals(plan.getIsActive())) {
                continue;
            }

            HealthCard subscriptionCard = getOrCreateSubscriptionCard(patient.getId());

            while (!today.isBefore(subscription.getEndDate())) {
                allocateMonthlyHt(patient, plan, subscription, subscriptionCard, "SUBSCRIPTION_RECURRING");
                subscription.setEndDate(subscription.getEndDate().plusMonths(1));
                allocations++;
            }

            patientSubscriptionRepository.save(subscription);
        }

        return allocations;
    }

    private HealthCard getOrCreateSubscriptionCard(UUID patientId) {
        Card card = cardRepository.findByCardNameIgnoreCase("Subscription Card").orElseGet(() -> {
            Card c = new Card();
            c.setCardName("Subscription Card");
            return cardRepository.save(c);
        });

        return healthCardRepository.findByPatientIdAndCardId(patientId, card.getCardId())
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    HealthCard hc = new HealthCard();
                    hc.setPatientId(patientId);
                    hc.setCardId(card.getCardId());
                    hc.setCardNum(generateCardNum());
                    hc.setHtBalance(BigDecimal.ZERO);
                    hc.setExpiryDate(LocalDate.now().plusYears(1));
                    hc.setCvv(String.format("%03d", new Random().nextInt(1000)));
                    return healthCardRepository.save(hc);
                });
    }

    private void allocateMonthlyHt(Patient patient,
                                   SubscriptionPlan plan,
                                   PatientSubscription subscription,
                                   HealthCard subscriptionCard,
                                   String source) {
        BigDecimal htAllocation = calculateMonthlyHt(plan.getAmountPerMonth());
        if (htAllocation.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        // Credit subscription card HT balance.
        subscriptionCard.setHtBalance(nz(subscriptionCard.getHtBalance()).add(htAllocation));
        healthCardRepository.save(subscriptionCard);

        // Credit patient wallet HT balance used by wallet pages.
        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                .orElseGet(() -> {
                    PatientTokenBalance b = new PatientTokenBalance();
                    b.setPatientId(patient.getId());
                    b.setTotalAt(BigDecimal.ZERO);
                    b.setTotalHt(BigDecimal.ZERO);
                    b.setLastUpdated(java.time.LocalDateTime.now());
                    return b;
                });

        balance.setTotalHt(nz(balance.getTotalHt()).add(htAllocation));
        balance.setLastUpdated(java.time.LocalDateTime.now());
        patientTokenBalanceRepository.save(balance);

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId == null) {
            throw new IllegalStateException("HT token is not configured in tokens table");
        }

        Transaction tx = new Transaction();
        tx.setUserId(patient.getUserId());
        tx.setTokenId(htTokenId);
        tx.setType(Transaction.TransactionType.CREDIT);
        tx.setAmount(htAllocation);
        tx.setDescription(String.format("Monthly HT allocation for %s (%s)", plan.getSubscriptionName(), source));
        tx.setSenderWalletAddress("SUBSCRIPTION_SYSTEM");
        tx.setReceiverWalletAddress(patient.getWalletAddress());
        tx.setTransactionHash("0x" + String.format("%064x", System.currentTimeMillis()));
        tx.setStatus("CONFIRMED");
        tx.setTimestamp(java.time.LocalDateTime.now());
        walletTransactionRepository.save(tx);

        ActivityLog activity = new ActivityLog();
        activity.setUserId(patient.getUserId());
        activity.setActivityName("Monthly HT Allocation");
        activity.setDescription(String.format(
                "%s HT credited to Subscription Card for plan '%s' (Subscription ID: %s)",
                htAllocation.toPlainString(),
                plan.getSubscriptionName(),
                subscription.getSubscriptionId()));
        activity.setType(ActivityLog.ActivityType.ACTION);
        activity.setStatus("SUCCESS");
        activity.setTimestamp(java.time.LocalDateTime.now());
        activityLogRepository.save(activity);

        if ("SUBSCRIPTION_RECURRING".equals(source)) {
            notificationService.notifyUser(
                    patient.getUserId(),
                    patient.getUserId(),
                    "Monthly Subscription HT Credited",
                    htAllocation.toPlainString() + " HT credited for plan " + plan.getSubscriptionName() + "."
            );
        } else if ("SUBSCRIPTION_INITIAL".equals(source)) {
            notificationService.notifyUser(
                    patient.getUserId(),
                    patient.getUserId(),
                    "Initial Subscription HT Credited",
                    htAllocation.toPlainString() + " HT credited for your new subscription."
            );
        }
    }

    private BigDecimal calculateMonthlyHt(BigDecimal amountPerMonth) {
        if (amountPerMonth == null || amountPerMonth.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // Policy: 1000 PKR subscription fee == 10 HT monthly allocation.
        return amountPerMonth
                .divide(THOUSAND_PKR, 2, java.math.RoundingMode.HALF_UP)
                .multiply(HT_PER_THOUSAND_PKR)
                .setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String generateCardNum() {
        Random rng = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            if (i > 0 && i % 4 == 0) sb.append('-');
            sb.append(rng.nextInt(10));
        }
        String num = sb.toString();
        return healthCardRepository.existsByCardNum(num) ? generateCardNum() : num;
    }

    /**
     * Get payment history for a patient
     */
    public List<PaymentHistoryDto> getPaymentHistory(UUID userId) {
        // Find patient by userId
        Patient patient = patientRepository.findByUserId(userId)
                .orElse(null);

        if (patient == null) {
            return new ArrayList<>();
        }

        List<PaymentHistory> payments = paymentHistoryRepository
                .findByPatientIdOrderByTimestampDesc(patient.getId());

        return payments.stream()
                .map(this::convertToPaymentDto)
                .collect(Collectors.toList());
    }

    /**
     * Cancel patient subscription
     */
    @Transactional
    public ApiResponse<String> cancelSubscription(UUID userId) {
        try {
            Patient patient = patientRepository.findByUserId(userId)
                    .orElse(null);

            if (patient == null) {
                return ApiResponse.error("Patient not found");
            }

            PatientSubscription subscription = patientSubscriptionRepository
                    .findByPatientIdAndStatus(patient.getId(), PatientSubscription.SubscriptionStatus.ACTIVE)
                    .orElse(null);

            if (subscription == null) {
                return ApiResponse.error("No active subscription found");
            }

            subscription.setStatus(PatientSubscription.SubscriptionStatus.CANCELLED);
            patientSubscriptionRepository.save(subscription);

            patient.setHasSubscription(false);
            patientRepository.save(patient);

            notificationService.notifyUser(
                    userId,
                    userId,
                    "Subscription Cancelled",
                    "Your subscription has been cancelled and recurring allocations are stopped."
            );

            return ApiResponse.success("Subscription cancelled successfully", null);

        } catch (Exception e) {
            return ApiResponse.error("Failed to cancel subscription: " + e.getMessage());
        }
    }

    // Helper methods for DTO conversion

    private SubscriptionPlanDto convertToDto(SubscriptionPlan plan) {
        SubscriptionPlanDto dto = new SubscriptionPlanDto();
        dto.setSubsId(plan.getSubsId());
        dto.setHospitalId(plan.getHospitalId());
        dto.setHospitalName("SehatVault Hospital"); // TODO: Join with hospital table
        dto.setSubscriptionName(plan.getSubscriptionName());
        dto.setAmountPerMonth(plan.getAmountPerMonth());
        
        // Parse features from text to list
        if (plan.getFeatures() != null && !plan.getFeatures().isEmpty()) {
            dto.setFeatures(Arrays.asList(plan.getFeatures().split("\\|")));
        } else {
            dto.setFeatures(new ArrayList<>());
        }
        
        // Calculate HT tokens based on amount (1000 PKR = 10 HT)
        dto.setHtTokens(calculateMonthlyHt(plan.getAmountPerMonth()).setScale(0, java.math.RoundingMode.DOWN).intValue());
        dto.setIsActive(plan.getIsActive());
        
        return dto;
    }

    private PatientSubscriptionDto convertToSubscriptionDto(PatientSubscription subscription, SubscriptionPlan plan) {
        PatientSubscriptionDto dto = new PatientSubscriptionDto();
        dto.setSubsReqId(subscription.getSubsReqId());
        dto.setSubscriptionId(subscription.getSubscriptionId());
        dto.setSubscriptionName(plan.getSubscriptionName());
        dto.setAmount(plan.getAmountPerMonth());
        dto.setStartDate(subscription.getStartDate());
        dto.setEndDate(subscription.getEndDate());
        dto.setStatus(subscription.getStatus().toString());
        dto.setHtTokens(calculateMonthlyHt(plan.getAmountPerMonth()).setScale(0, java.math.RoundingMode.DOWN).intValue());
        return dto;
    }

    private PaymentHistoryDto convertToPaymentDto(PaymentHistory payment) {
        PaymentHistoryDto dto = new PaymentHistoryDto();
        dto.setPaymentId(payment.getPaymentId());
        dto.setPatientId(payment.getPatientId());
        dto.setSubsId(payment.getSubsId());
        
        // Get subscription name
        subscriptionPlanRepository.findById(payment.getSubsId())
                .ifPresent(plan -> dto.setSubscriptionName(plan.getSubscriptionName()));
        
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setStatus(payment.getStatus().toString());
        dto.setInvoiceUrl(payment.getInvoiceUrl());
        dto.setTimestamp(payment.getTimestamp());
        
        return dto;
    }
}
