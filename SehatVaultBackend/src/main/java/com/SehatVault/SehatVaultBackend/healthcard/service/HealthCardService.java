package com.SehatVault.SehatVaultBackend.healthcard.service;

import com.SehatVault.SehatVaultBackend.healthcard.dto.HealthCardDto;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for Health Card management
 */
@Service
@RequiredArgsConstructor
public class HealthCardService {

    private final HealthCardRepository healthCardRepository;
    private final PatientRepository patientRepository;

    /**
     * Get all health cards for a patient by user ID
     */
    public List<HealthCardDto> getPatientHealthCards(UUID userId) {
        // Find patient by userId
        Patient patient = patientRepository.findByUserId(userId)
                .orElse(null);

        if (patient == null) {
            return List.of();
        }

        // Get all health cards for this patient
        List<HealthCard> healthCards = healthCardRepository.findByPatientId(patient.getId());

        return healthCards.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get health cards by type for a patient
     */
    public List<HealthCardDto> getPatientHealthCardsByType(UUID userId, String cardType) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElse(null);

        if (patient == null) {
            return List.of();
        }

        HealthCard.CardType type;
        try {
            type = HealthCard.CardType.valueOf(cardType.toUpperCase());
        } catch (IllegalArgumentException e) {
            return List.of();
        }

        List<HealthCard> healthCards = healthCardRepository.findByPatientIdAndCardType(
                patient.getId(), type);

        return healthCards.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get active health cards for a patient
     */
    public List<HealthCardDto> getActiveHealthCards(UUID userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElse(null);

        if (patient == null) {
            return List.of();
        }

        List<HealthCard> healthCards = healthCardRepository.findByPatientIdAndStatus(
                patient.getId(), HealthCard.CardStatus.ACTIVE);

        return healthCards.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert HealthCard entity to DTO
     */
    private HealthCardDto convertToDto(HealthCard card) {
        HealthCardDto dto = new HealthCardDto();
        dto.setCardId(card.getCardId().toString());
        dto.setPatientId(card.getPatientId().toString());
        dto.setCardNumber(card.getCardNumber());
        dto.setCardType(card.getCardType().toString());
        dto.setHolderName(card.getHolderName());
        dto.setPlanName(card.getPlanName());
        dto.setAssetValue(card.getAssetValue());
        dto.setHtBalance(card.getHtBalance());
        dto.setValidUntil(card.getValidUntil() != null ? card.getValidUntil().toString() : null);
        dto.setIssueDate(card.getIssueDate().toString());
        dto.setStatus(card.getStatus().toString());
        dto.setCvv(card.getCvv());
        dto.setSecurityKey(card.getSecurityKey());
        dto.setSubscriptionId(card.getSubscriptionId() != null ? card.getSubscriptionId().toString() : null);
        return dto;
    }

    /**
     * Generate a unique card number
     */
    private String generateCardNumber(HealthCard.CardType cardType) {
        String prefix = cardType == HealthCard.CardType.SUBSCRIPTION ? "SUB" : "AST";
        int year = java.time.Year.now().getValue();
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        
        String cardNumber;
        do {
            cardNumber = String.format("%s-%d-%06d", prefix, year, number);
            number++;
        } while (healthCardRepository.existsByCardNumber(cardNumber));
        
        return cardNumber;
    }

    /**
     * Generate a random CVV
     */
    private String generateCVV() {
        Random random = new Random();
        return String.format("%03d", random.nextInt(1000));
    }

    /**
     * Generate a random security key
     */
    private String generateSecurityKey() {
        Random random = new Random();
        return String.format("SK%06d", random.nextInt(1000000));
    }
}
