package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.HealthBenefitDTO;
import com.fixed_asset.patient_service.dto.RedemptionRequest;
import com.fixed_asset.patient_service.dto.RedemptionResponse;
import com.fixed_asset.patient_service.dto.TokenBalanceDTO;
import com.fixed_asset.patient_service.model.BenefitRedemption;
import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.repository.BenefitRedemptionRepository;
import com.fixed_asset.patient_service.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BenefitServiceImpl implements BenefitService {

    @Autowired
    private BenefitRedemptionRepository redemptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private TokenService tokenService;

    private final List<HealthBenefitDTO> availableBenefits = Arrays.asList(
        new HealthBenefitDTO("CHECKUP", "Regular Health Checkup", 10.0, true, "Minimum 10 HT required"),
        new HealthBenefitDTO("MEDICINE", "Medicine Discount (20%)", 5.0, true, "Minimum 5 HT required"),
        new HealthBenefitDTO("INSURANCE", "Health Insurance Coverage", 50.0, true, "Minimum 50 HT required"),
        new HealthBenefitDTO("SPECIALIST", "Specialist Consultation", 25.0, true, "Minimum 25 HT required"),
        new HealthBenefitDTO("DIAGNOSTIC", "Diagnostic Tests Package", 30.0, true, "Minimum 30 HT required")
    );

    @Override
    public List<HealthBenefitDTO> getAvailableBenefits(Long patientId) {
        TokenBalanceDTO balance = tokenService.getTokenBalance(patientId);
        
        return availableBenefits.stream()
                .map(benefit -> {
                    boolean available = balance.getHealthTokenBalance() >= benefit.getHtCost();
                    String eligibility = available ? "Eligible" : "Requires " + benefit.getHtCost() + " HT (Current: " + balance.getHealthTokenBalance() + " HT)";
                    
                    HealthBenefitDTO updatedBenefit = new HealthBenefitDTO();
                    updatedBenefit.setServiceType(benefit.getServiceType());
                    updatedBenefit.setDescription(benefit.getDescription());
                    updatedBenefit.setHtCost(benefit.getHtCost());
                    updatedBenefit.setAvailable(available);
                    updatedBenefit.setEligibility(eligibility);
                    
                    return updatedBenefit;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RedemptionResponse redeemBenefit(RedemptionRequest redemptionRequest) {
        Patient patient = patientRepository.findById(redemptionRequest.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + redemptionRequest.getPatientId()));

        // Check if patient has sufficient HT balance
        TokenBalanceDTO balance = tokenService.getTokenBalance(patient.getId());
        if (balance.getHealthTokenBalance() < redemptionRequest.getHtAmount()) {
            return new RedemptionResponse(
                null,
                patient.getId(),
                redemptionRequest.getServiceType(),
                redemptionRequest.getHtAmount(),
                "REJECTED",
                LocalDateTime.now(),
                "Insufficient health tokens. Available: " + balance.getHealthTokenBalance() + " HT, Required: " + redemptionRequest.getHtAmount() + " HT"
            );
        }

        // Create redemption record
        BenefitRedemption redemption = new BenefitRedemption();
        redemption.setPatient(patient);
        redemption.setRedemptionId(generateRedemptionId());
        redemption.setServiceType(redemptionRequest.getServiceType());
        redemption.setHtAmount(redemptionRequest.getHtAmount());
        redemption.setStatus("PENDING");
        redemption.setDescription("Redeeming " + redemptionRequest.getServiceType() + " service");

        BenefitRedemption savedRedemption = redemptionRepository.save(redemption);

        return new RedemptionResponse(
            savedRedemption.getRedemptionId(),
            patient.getId(),
            savedRedemption.getServiceType(),
            savedRedemption.getHtAmount(),
            savedRedemption.getStatus(),
            savedRedemption.getCreatedAt(),  // This should be 'redeemedAt' in your DTO
            "Redemption request submitted successfully"
        );
    }

    @Override
    public List<RedemptionResponse> getRedemptionHistory(Long patientId) {
        List<BenefitRedemption> redemptions = redemptionRepository.findByPatientId(patientId);
        return redemptions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RedemptionResponse getRedemptionById(String redemptionId) {
        BenefitRedemption redemption = redemptionRepository.findByRedemptionId(redemptionId)
                .orElseThrow(() -> new RuntimeException("Redemption not found with id: " + redemptionId));
        return convertToResponse(redemption);
    }

    @Override
    @Transactional
    public boolean approveRedemption(String redemptionId, String hospitalId) {
        BenefitRedemption redemption = redemptionRepository.findByRedemptionId(redemptionId)
                .orElseThrow(() -> new RuntimeException("Redemption not found with id: " + redemptionId));

        // Deduct HT tokens
        boolean deducted = tokenService.updateHealthTokenBalance(redemption.getPatient().getId(), -redemption.getHtAmount());
        if (!deducted) {
            throw new RuntimeException("Failed to deduct health tokens");
        }

        redemption.setStatus("APPROVED");
        redemption.setHospitalId(hospitalId);
        redemption.setProcessedAt(LocalDateTime.now());

        redemptionRepository.save(redemption);
        return true;
    }

    @Override
    @Transactional
    public boolean completeRedemption(String redemptionId, String transactionHash) {
        BenefitRedemption redemption = redemptionRepository.findByRedemptionId(redemptionId)
                .orElseThrow(() -> new RuntimeException("Redemption not found with id: " + redemptionId));

        redemption.setStatus("COMPLETED");
        redemption.setTransactionHash(transactionHash);
        redemption.setCompletedAt(LocalDateTime.now());

        redemptionRepository.save(redemption);
        return true;
    }

    @Override
    public Double getTotalRedeemedHT(Long patientId) {
        return redemptionRepository.sumRedeemedHTByPatientId(patientId);
    }

    private String generateRedemptionId() {
        return "RED-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private RedemptionResponse convertToResponse(BenefitRedemption redemption) {
        return new RedemptionResponse(
            redemption.getRedemptionId(),
            redemption.getPatient().getId(),
            redemption.getServiceType(),
            redemption.getHtAmount(),
            redemption.getStatus(),
            redemption.getCreatedAt(),
            "Redemption " + redemption.getStatus().toLowerCase()
        );
    }
}