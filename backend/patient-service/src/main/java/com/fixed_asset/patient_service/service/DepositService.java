package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.DepositRequest;
import com.fixed_asset.patient_service.dto.DepositResponse;
import com.fixed_asset.patient_service.model.AssetDeposit;

import java.util.List;

public interface DepositService {
    DepositResponse submitDeposit(DepositRequest depositRequest);
    DepositResponse getDepositById(Long depositId);
    List<DepositResponse> getDepositsByPatientId(Long patientId);
    List<DepositResponse> getDepositsByStatus(String status);
    DepositResponse updateDepositStatus(Long depositId, String status, String depositIdHash);
    boolean approveDeposit(Long depositId, Double tokensToMint, String depositIdHash);
    boolean rejectDeposit(Long depositId, String reason);
    Double getTotalProcessedTokens(Long patientId);
}