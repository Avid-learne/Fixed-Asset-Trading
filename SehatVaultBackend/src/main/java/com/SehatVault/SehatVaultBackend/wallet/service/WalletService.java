package com.SehatVault.SehatVaultBackend.wallet.service;

import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.wallet.dto.WalletSummaryDto;
import com.SehatVault.SehatVaultBackend.wallet.dto.WalletTransactionDto;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public WalletSummaryDto getWalletSummary(UUID userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found for this user"));

        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                .orElse(null);

        return new WalletSummaryDto(
                userId.toString(),
                patient.getId().toString(),
                patient.getWalletAddress(),
                balance != null && balance.getTotalAt() != null ? balance.getTotalAt() : BigDecimal.ZERO,
                balance != null && balance.getTotalHt() != null ? balance.getTotalHt() : BigDecimal.ZERO
        );
    }

    public List<WalletTransactionDto> getWalletTransactions(UUID userId) {
        return walletTransactionRepository.findRecentByUserId(userId)
                .stream()
                .map(this::mapRow)
                .collect(Collectors.toList());
    }

    public List<WalletTransactionDto> getWalletTransactionsByToken(UUID userId, String tokenSymbol) {
        return walletTransactionRepository.findRecentByUserIdAndTokenSymbol(userId, tokenSymbol)
                .stream()
                .map(this::mapRow)
                .collect(Collectors.toList());
    }

    private WalletTransactionDto mapRow(WalletTransactionRepository.WalletTransactionRow row) {
        return new WalletTransactionDto(
                row.getTransactionId() != null ? row.getTransactionId().toString() : null,
                row.getTokenSymbol(),
                row.getTransactionType(),
                row.getAmount(),
                row.getDescription(),
                row.getSenderWalletAddress(),
                row.getReceiverWalletAddress(),
                row.getBlockNumber(),
                row.getTransactionHash(),
                row.getStatus(),
                row.getTimestamp() != null ? row.getTimestamp().toString() : null
        );
    }
}
