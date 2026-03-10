package com.SehatVault.SehatVaultBackend.profile.service;

import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.profile.dto.ProfileResponse;
import com.SehatVault.SehatVaultBackend.profile.dto.ProfileUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Profile Service
 * Handles profile-related business logic
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    /**
     * Get user profile by user ID
     */
    public ProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProfileResponse.ProfileResponseBuilder responseBuilder = ProfileResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNum(user.getPhoneNum())
                .address(user.getAddress())
                .city(user.getCity())
                .bloodGroup(user.getBloodGroup())
                .dateOfBirth(user.getDateOfBirth())
                .role(user.getRole().getRoleName().name())
                .status(user.getStatus() != null ? user.getStatus().name() : null);

        // If user is a patient, add patient-specific data
        Patient patient = patientRepository.findByUserId(userId).orElse(null);
        if (patient != null) {
            responseBuilder
                    .patientId(patient.getId())
                    .walletAddress(patient.getWalletAddress())
                    .bio(patient.getBio())
                    .hasAsset(patient.getHasAsset())
                    .hasSubscription(patient.getHasSubscription())
                    .kycStatus(patient.getKycStatus() != null ? patient.getKycStatus().name() : null)
                    .registrationId(patient.getRegistrationId());
        }

        return responseBuilder.build();
    }

    /**
     * Update user profile
     */
    @Transactional
    public ProfileResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user fields
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhoneNum() != null && !request.getPhoneNum().trim().isEmpty()) {
            user.setPhoneNum(request.getPhoneNum().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity().trim());
        }

        // Save updated user
        user = userRepository.save(user);

        // Update bio if user is a patient
        if (request.getBio() != null) {
            Patient patient = patientRepository.findByUserId(userId).orElse(null);
            if (patient != null) {
                patient.setBio(request.getBio().trim());
                patientRepository.save(patient);
            }
        }

        // Return updated profile
        return getProfile(userId);
    }

    /**
     * Update patient wallet address
     */
    @Transactional
    public void updateWalletAddress(UUID userId, String walletAddress) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        patient.setWalletAddress(walletAddress);
        patientRepository.save(patient);
    }
}
