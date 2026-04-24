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
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

            PatientSubscriptionDto dto = convertToSubscriptionDto(subscription, plan);
            return ApiResponse.success("Subscription successful", dto);

        } catch (Exception e) {
            return ApiResponse.error("Subscription failed: " + e.getMessage());
        }
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
    }

    private BigDecimal calculateMonthlyHt(BigDecimal amountPerMonth) {
        if (amountPerMonth == null || amountPerMonth.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return amountPerMonth
                .divide(BigDecimal.valueOf(1000), 2, java.math.RoundingMode.HALF_UP)
                .multiply(tokenPriceService.getHtPricePkr())
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
        dto.setHtTokens(plan.getAmountPerMonth().divide(BigDecimal.valueOf(1000)).multiply(BigDecimal.valueOf(10)).intValue());
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
        dto.setHtTokens(plan.getAmountPerMonth().divide(BigDecimal.valueOf(1000)).multiply(BigDecimal.valueOf(10)).intValue());
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
