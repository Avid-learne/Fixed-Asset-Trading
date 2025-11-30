package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.DepositRequest;
import com.fixed_asset.patient_service.dto.DepositResponse;
import com.fixed_asset.patient_service.model.AssetDeposit;
import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.repository.AssetDepositRepository;
import com.fixed_asset.patient_service.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepositServiceImpl implements DepositService {

    @Autowired
    private AssetDepositRepository depositRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Override
    @Transactional
    public DepositResponse submitDeposit(DepositRequest depositRequest) {
        Patient patient = patientRepository.findById(depositRequest.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + depositRequest.getPatientId()));

        AssetDeposit deposit = new AssetDeposit();
        deposit.setPatient(patient);
        deposit.setAssetType(depositRequest.getAssetType());
        deposit.setAssetValue(depositRequest.getAssetValue());
        deposit.setStatus("PENDING");
        deposit.setMetadata(depositRequest.getDescription());

        AssetDeposit savedDeposit = depositRepository.save(deposit);
        return convertToResponse(savedDeposit);
    }

    @Override
    public DepositResponse getDepositById(Long depositId) {
        AssetDeposit deposit = depositRepository.findById(depositId)
                .orElseThrow(() -> new RuntimeException("Deposit not found with id: " + depositId));
        return convertToResponse(deposit);
    }

    @Override
    public List<DepositResponse> getDepositsByPatientId(Long patientId) {
        List<AssetDeposit> deposits = depositRepository.findByPatientId(patientId);
        return deposits.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DepositResponse> getDepositsByStatus(String status) {
        List<AssetDeposit> deposits = depositRepository.findByStatus(status);
        return deposits.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DepositResponse updateDepositStatus(Long depositId, String status, String depositIdHash) {
        AssetDeposit deposit = depositRepository.findById(depositId)
                .orElseThrow(() -> new RuntimeException("Deposit not found with id: " + depositId));

        deposit.setStatus(status);
        if (depositIdHash != null) {
            deposit.setDepositId(depositIdHash);
        }
        if ("PROCESSED".equals(status)) {
            deposit.setProcessedAt(LocalDateTime.now());
        }

        AssetDeposit updatedDeposit = depositRepository.save(deposit);
        return convertToResponse(updatedDeposit);
    }

    @Override
    @Transactional
    public boolean approveDeposit(Long depositId, Double tokensToMint, String depositIdHash) {
        AssetDeposit deposit = depositRepository.findById(depositId)
                .orElseThrow(() -> new RuntimeException("Deposit not found with id: " + depositId));

        deposit.setStatus("APPROVED");
        deposit.setTokensMinted(tokensToMint);
        deposit.setDepositId(depositIdHash);
        deposit.setProcessedAt(LocalDateTime.now());

        depositRepository.save(deposit);
        return true;
    }

    @Override
    @Transactional
    public boolean rejectDeposit(Long depositId, String reason) {
        AssetDeposit deposit = depositRepository.findById(depositId)
                .orElseThrow(() -> new RuntimeException("Deposit not found with id: " + depositId));

        deposit.setStatus("REJECTED");
        deposit.setMetadata(reason);
        deposit.setProcessedAt(LocalDateTime.now());

        depositRepository.save(deposit);
        return true;
    }

    @Override
    public Double getTotalProcessedTokens(Long patientId) {
        return depositRepository.sumProcessedTokensByPatientId(patientId);
    }

    private DepositResponse convertToResponse(AssetDeposit deposit) {
        DepositResponse response = new DepositResponse();
        response.setId(deposit.getId());
        response.setPatientId(deposit.getPatient().getId());
        response.setAssetType(deposit.getAssetType());
        response.setAssetValue(deposit.getAssetValue());
        response.setTokensMinted(deposit.getTokensMinted());
        response.setDepositId(deposit.getDepositId());
        response.setStatus(deposit.getStatus());
        response.setMetadata(deposit.getMetadata());
        response.setCreatedAt(deposit.getCreatedAt());
        response.setProcessedAt(deposit.getProcessedAt());
        return response;
    }
}