package com.SehatVault.SehatVaultBackend.subscription.service;

import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.subscription.dto.*;
import com.SehatVault.SehatVaultBackend.subscription.entity.PatientSubscription;
import com.SehatVault.SehatVaultBackend.subscription.entity.PaymentHistory;
import com.SehatVault.SehatVaultBackend.subscription.entity.SubscriptionPlan;
import com.SehatVault.SehatVaultBackend.subscription.repository.PatientSubscriptionRepository;
import com.SehatVault.SehatVaultBackend.subscription.repository.PaymentHistoryRepository;
import com.SehatVault.SehatVaultBackend.subscription.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
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

            PatientSubscriptionDto dto = convertToSubscriptionDto(subscription, plan);
            return ApiResponse.success("Subscription successful", dto);

        } catch (Exception e) {
            return ApiResponse.error("Subscription failed: " + e.getMessage());
        }
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
