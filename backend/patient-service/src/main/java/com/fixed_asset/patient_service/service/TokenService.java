package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.TokenBalanceDTO;
import com.fixed_asset.patient_service.dto.TokenTransactionDTO;

import java.util.List;

public interface TokenService {
    TokenBalanceDTO getTokenBalance(Long patientId);
    boolean updateAssetTokenBalance(Long patientId, Double amount);
    boolean updateHealthTokenBalance(Long patientId, Double amount);
    boolean transferAssetTokens(Long fromPatientId, Long toPatientId, Double amount);
    List<TokenTransactionDTO> getTokenTransactions(Long patientId);
    List<TokenTransactionDTO> getTokenTransactionsByType(Long patientId, String tokenType);
    Double getTotalMintedTokens(Long patientId, String tokenType);
}