package com.fixed_asset.patient_service.service;

import com.fixed_asset.patient_service.dto.TokenBalanceDTO;
import com.fixed_asset.patient_service.dto.TokenTransactionDTO;
import com.fixed_asset.patient_service.model.Patient;
import com.fixed_asset.patient_service.model.TokenBalance;
import com.fixed_asset.patient_service.model.TokenTransaction;
import com.fixed_asset.patient_service.repository.PatientRepository;
import com.fixed_asset.patient_service.repository.TokenBalanceRepository;
import com.fixed_asset.patient_service.repository.TokenTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TokenServiceImpl implements TokenService {

    @Autowired
    private TokenBalanceRepository tokenBalanceRepository;

    @Autowired
    private TokenTransactionRepository tokenTransactionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Override
    public TokenBalanceDTO getTokenBalance(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        TokenBalance balance = tokenBalanceRepository.findByPatientId(patientId)
                .orElseGet(() -> createTokenBalance(patient));

        return new TokenBalanceDTO(
            patientId,
            balance.getAssetTokenBalance(),
            balance.getHealthTokenBalance(),
            patient.getWalletAddress()
        );
    }

    @Override
    @Transactional
    public boolean updateAssetTokenBalance(Long patientId, Double amount) {
        if (amount > 0) {
            tokenBalanceRepository.incrementAssetTokenBalance(patientId, amount);
            createTransaction(patientId, "MINT", amount, "AT", "Asset token minted");
        } else {
            int updated = tokenBalanceRepository.decrementAssetTokenBalance(patientId, Math.abs(amount));
            if (updated > 0) {
                createTransaction(patientId, "BURN", Math.abs(amount), "AT", "Asset token burned");
            } else {
                throw new RuntimeException("Insufficient asset token balance");
            }
        }
        return true;
    }

    @Override
    @Transactional
    public boolean updateHealthTokenBalance(Long patientId, Double amount) {
        if (amount > 0) {
            tokenBalanceRepository.incrementHealthTokenBalance(patientId, amount);
            createTransaction(patientId, "MINT", amount, "HT", "Health token minted");
        } else {
            int updated = tokenBalanceRepository.decrementHealthTokenBalance(patientId, Math.abs(amount));
            if (updated > 0) {
                createTransaction(patientId, "BURN", Math.abs(amount), "HT", "Health token burned");
            } else {
                throw new RuntimeException("Insufficient health token balance");
            }
        }
        return true;
    }

    @Override
    @Transactional
    public boolean transferAssetTokens(Long fromPatientId, Long toPatientId, Double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Transfer amount must be positive");
        }

        // Debit from sender
        int debited = tokenBalanceRepository.decrementAssetTokenBalance(fromPatientId, amount);
        if (debited == 0) {
            throw new RuntimeException("Insufficient balance for transfer");
        }

        // Credit to receiver
        tokenBalanceRepository.incrementAssetTokenBalance(toPatientId, amount);

        // Create transactions
        createTransaction(fromPatientId, "TRANSFER", -amount, "AT", "Transferred to patient " + toPatientId);
        createTransaction(toPatientId, "TRANSFER", amount, "AT", "Received from patient " + fromPatientId);

        return true;
    }

    @Override
    public List<TokenTransactionDTO> getTokenTransactions(Long patientId) {
        List<TokenTransaction> transactions = tokenTransactionRepository.findByPatientId(patientId);
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TokenTransactionDTO> getTokenTransactionsByType(Long patientId, String tokenType) {
        List<TokenTransaction> transactions = tokenTransactionRepository.findByPatientIdAndTokenType(patientId, tokenType);
        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Double getTotalMintedTokens(Long patientId, String tokenType) {
        return tokenTransactionRepository.sumMintedTokensByPatientAndType(patientId, tokenType);
    }

    private TokenBalance createTokenBalance(Patient patient) {
        TokenBalance balance = new TokenBalance(patient);
        return tokenBalanceRepository.save(balance);
    }

    private void createTransaction(Long patientId, String transactionType, Double amount, String tokenType, String metadata) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        TokenTransaction transaction = new TokenTransaction();
        transaction.setPatient(patient);
        transaction.setTransactionType(transactionType);
        transaction.setAmount(amount);
        transaction.setTokenType(tokenType);
        transaction.setStatus("CONFIRMED");
        transaction.setMetadata(metadata);
        transaction.setConfirmedAt(LocalDateTime.now());

        tokenTransactionRepository.save(transaction);
    }

    private TokenTransactionDTO convertToDTO(TokenTransaction transaction) {
        return new TokenTransactionDTO(
            transaction.getTransactionHash(),
            transaction.getTransactionType(),
            transaction.getAmount(),
            transaction.getTokenType(),
            transaction.getCreatedAt(),  // This should match your entity field name
            transaction.getStatus()
    );
}
}