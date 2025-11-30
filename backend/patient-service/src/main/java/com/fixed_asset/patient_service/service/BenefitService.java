package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.HealthBenefitDTO;
import com.fixed_asset.patient_service.dto.RedemptionRequest;
import com.fixed_asset.patient_service.dto.RedemptionResponse;

import java.util.List;

public interface BenefitService {
    List<HealthBenefitDTO> getAvailableBenefits(Long patientId);
    RedemptionResponse redeemBenefit(RedemptionRequest redemptionRequest);
    List<RedemptionResponse> getRedemptionHistory(Long patientId);
    RedemptionResponse getRedemptionById(String redemptionId);
    boolean approveRedemption(String redemptionId, String hospitalId);
    boolean completeRedemption(String redemptionId, String transactionHash);
    Double getTotalRedeemedHT(Long patientId);
}