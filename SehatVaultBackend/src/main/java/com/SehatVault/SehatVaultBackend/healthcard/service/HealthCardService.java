package com.SehatVault.SehatVaultBackend.healthcard.service;

import com.SehatVault.SehatVaultBackend.healthcard.dto.HealthCardDto;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for Health Card management
 */
@Service
@RequiredArgsConstructor
public class HealthCardService {

    private final HealthCardRepository healthCardRepository;
    private final CardRepository cardRepository;
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

        String expectedCardName;
        if ("SUBSCRIPTION".equalsIgnoreCase(cardType)) {
            expectedCardName = "Subscription Card";
        } else if ("ASSET".equalsIgnoreCase(cardType)) {
            expectedCardName = "Asset Health Card";
        } else {
            return List.of();
        }

        Card card = cardRepository.findByCardNameIgnoreCase(expectedCardName).orElse(null);
        if (card == null) {
            return List.of();
        }

        List<HealthCard> healthCards = healthCardRepository.findByPatientIdAndCardId(patient.getId(), card.getCardId());

        return healthCards.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get active health cards for a patient
     */
    public List<HealthCardDto> getActiveHealthCards(UUID userId) {
        // Schema does not define card status on patient_cards, so return all cards for this patient.
        return getPatientHealthCards(userId);
    }

    /**
     * Convert HealthCard entity to DTO
     */
    private HealthCardDto convertToDto(HealthCard card) {
        HealthCardDto dto = new HealthCardDto();
        dto.setPatientCardId(card.getPatientCardId().toString());
        dto.setPatientId(card.getPatientId().toString());
        dto.setCardId(card.getCardId().toString());
        dto.setCardNum(card.getCardNum());
        dto.setHtBalance(card.getHtBalance());
        dto.setExpiryDate(card.getExpiryDate() != null ? card.getExpiryDate().toString() : null);
        dto.setCvv(card.getCvv());
        cardRepository.findById(card.getCardId()).ifPresent(c -> dto.setCardName(c.getCardName()));
        return dto;
    }
}
