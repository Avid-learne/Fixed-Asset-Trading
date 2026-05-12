package com.SehatVault.SehatVaultBackend.profile.service;

import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import com.SehatVault.SehatVaultBackend.notification.entity.Notification;
import com.SehatVault.SehatVaultBackend.notification.repository.NotificationRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.profile.dto.ProfileResponse;
import com.SehatVault.SehatVaultBackend.profile.dto.ProfileUpdateRequest;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Profile Service
 * Handles profile-related business logic
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final AssetDepositRepository assetDepositRepository;
    private final NotificationRepository notificationRepository;

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
            .cnic(user.getCnic())
                .gender(user.getGender())
                .nationality(user.getNationality())
                .cnicIssueDate(user.getCnicIssueDate())
                .cnicExpiryDate(user.getCnicExpiryDate())
                .phoneNum(user.getPhoneNum())
                .address(user.getAddress())
                .city(user.getCity())
                .country(user.getCountry())
                .postalCode(user.getPostalCode())
                .bloodGroup(user.getBloodGroup())
                .occupation(user.getOccupation())
                .sourceOfIncome(user.getSourceOfIncome())
                .healthIssues(user.getHealthIssues())
                .dateOfBirth(user.getDateOfBirth())
                .role(user.getRole().getRoleName().name())
                .status(user.getStatus() != null ? user.getStatus().name() : null);

        // If user is a patient, add patient-specific data
        Patient patient = patientRepository.findByUserId(userId).orElse(null);
        if (patient != null) {
            UUID resolvedHospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : user.getHospitalId();
            responseBuilder
                    .patientId(patient.getId())
                    .walletAddress(patient.getWalletAddress())
                    .hasAsset(patient.getHasAsset())
                    .hasSubscription(patient.getHasSubscription())
                    .kycStatus(patient.getKycStatus() != null ? patient.getKycStatus().name() : null)
                    .kycSubmittedAt(patient.getKycSubmittedAt())
                    .kycReviewedAt(patient.getKycReviewedAt())
                    .kycReviewedBy(patient.getKycReviewedBy())
                    .kycRejectionReason(patient.getKycRejectionReason())
                    .kycDocumentFront(patient.getKycDocumentFront())
                    .kycDocumentBack(patient.getKycDocumentBack())
                    .kycSelfie(patient.getKycSelfie())
                .registrationId(patient.getRegistrationId())
                .hospitalId(resolvedHospitalId)
                .hospitalName(resolveHospitalName(resolvedHospitalId));
            enrichPatientFinancials(responseBuilder, patient);
        } else if (user.getHospitalId() != null) {
            responseBuilder
                .hospitalId(user.getHospitalId())
                .hospitalName(resolveHospitalName(user.getHospitalId()));
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
        Patient patient = patientRepository.findByUserId(userId).orElse(null);

        // Update user fields
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getCnic() != null && !request.getCnic().trim().isEmpty()) {
            String cnic = request.getCnic().trim();
            if (userRepository.existsByCnicAndUserIdNot(cnic, userId)) {
                throw new RuntimeException("CNIC is already registered with another account");
            }
            user.setCnic(cnic);
        }
        if (request.getGender() != null && !request.getGender().trim().isEmpty()) {
            user.setGender(request.getGender().trim());
        }
        if (request.getNationality() != null && !request.getNationality().trim().isEmpty()) {
            user.setNationality(request.getNationality().trim());
        }
        if (request.getCnicIssueDate() != null && !request.getCnicIssueDate().trim().isEmpty()) {
            try {
                user.setCnicIssueDate(LocalDate.parse(request.getCnicIssueDate().trim()));
            } catch (DateTimeParseException ex) {
                throw new RuntimeException("Invalid cnicIssueDate format. Use YYYY-MM-DD");
            }
        }
        if (request.getCnicExpiryDate() != null && !request.getCnicExpiryDate().trim().isEmpty()) {
            try {
                user.setCnicExpiryDate(LocalDate.parse(request.getCnicExpiryDate().trim()));
            } catch (DateTimeParseException ex) {
                throw new RuntimeException("Invalid cnicExpiryDate format. Use YYYY-MM-DD");
            }
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
        if (request.getCountry() != null && !request.getCountry().trim().isEmpty()) {
            user.setCountry(request.getCountry().trim());
        }
        if (request.getPostalCode() != null && !request.getPostalCode().trim().isEmpty()) {
            user.setPostalCode(request.getPostalCode().trim());
        }
        if (request.getBloodGroup() != null) {
            user.setBloodGroup(request.getBloodGroup().trim());
        }
        if (request.getOccupation() != null && !request.getOccupation().trim().isEmpty()) {
            user.setOccupation(request.getOccupation().trim());
        }
        if (request.getSourceOfIncome() != null && !request.getSourceOfIncome().trim().isEmpty()) {
            user.setSourceOfIncome(request.getSourceOfIncome().trim());
        }
        if (request.getHealthIssues() != null) {
            user.setHealthIssues(request.getHealthIssues().trim());
        }
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
            try {
                user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth().trim()));
            } catch (DateTimeParseException ex) {
                throw new RuntimeException("Invalid dateOfBirth format. Use YYYY-MM-DD");
            }
        }

        if (patient != null) {
            if (request.getKycDocumentFront() != null && !request.getKycDocumentFront().trim().isEmpty()) {
                patient.setKycDocumentFront(request.getKycDocumentFront().trim());
            }
            if (request.getKycDocumentBack() != null && !request.getKycDocumentBack().trim().isEmpty()) {
                patient.setKycDocumentBack(request.getKycDocumentBack().trim());
            }
            if (request.getKycSelfie() != null && !request.getKycSelfie().trim().isEmpty()) {
                patient.setKycSelfie(request.getKycSelfie().trim());
            }
            patientRepository.save(patient);
        }

        // Save updated user
        user = userRepository.save(user);

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

        /**
         * Get current authenticated patient's KYC status
         */
        public Patient.KycStatus getKycStatus(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientRepository.findByUserId(user.getUserId())
            .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        return patient.getKycStatus();
        }

        /**
         * Submit current authenticated patient's KYC for review
         */
        @Transactional
        public Patient.KycStatus submitKyc(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Patient patient = patientRepository.findByUserId(user.getUserId())
            .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        validateKycPrerequisites(user);

        if (patient.getKycStatus() == Patient.KycStatus.APPROVED) {
            return Patient.KycStatus.APPROVED;
        }

        patient.setKycStatus(Patient.KycStatus.IN_PROGRESS);
        LocalDateTime submittedAt = LocalDateTime.now();
        patient.setKycSubmittedAt(submittedAt);
        patient.setKycReviewedAt(null);
        patient.setKycReviewedBy(null);
        patient.setKycRejectionReason(null);
        patientRepository.save(patient);

        UUID hospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : user.getHospitalId();
        if (hospitalId != null) {
            List<User> hospitalAdmins = userRepository.findAll().stream()
                    .filter(u -> u.getHospitalId() != null && u.getHospitalId().equals(hospitalId))
                    .filter(u -> u.getRole() != null && u.getRole().getRoleName() == com.SehatVault.SehatVaultBackend.auth.entity.Role.RoleType.hospital_admin)
                    .collect(Collectors.toList());

            if (!hospitalAdmins.isEmpty()) {
                String payload = "Patient Profiles::" + user.getName() + " submitted KYC for review";
                List<Notification> batch = hospitalAdmins.stream().map(admin -> {
                    Notification n = new Notification();
                    n.setSenderId(user.getUserId());
                    n.setReceiverId(admin.getUserId());
                    n.setNotificationText(payload);
                    n.setStatus(Notification.NotificationStatus.UNREAD);
                    n.setTimestamp(submittedAt);
                    return n;
                }).collect(Collectors.toList());
                notificationRepository.saveAll(batch);
            }
        }
        return patient.getKycStatus();
        }

    @Transactional
    public Patient.KycStatus reviewKyc(String adminEmail, UUID userId, boolean approved, String reason) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (admin.getRole() == null || admin.getRole().getRoleName() != com.SehatVault.SehatVaultBackend.auth.entity.Role.RoleType.hospital_admin) {
            throw new RuntimeException("Only hospital admins can review KYC submissions");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        UUID adminHospitalId = admin.getHospitalId();
        UUID patientHospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : user.getHospitalId();
        if (adminHospitalId == null || patientHospitalId == null || !adminHospitalId.equals(patientHospitalId)) {
            throw new RuntimeException("This KYC submission does not belong to your hospital");
        }

        patient.setKycStatus(approved ? Patient.KycStatus.APPROVED : Patient.KycStatus.REJECTED);
        patient.setKycReviewedAt(LocalDateTime.now());
        patient.setKycReviewedBy(admin.getUserId());
        patient.setKycRejectionReason(approved ? null : (reason != null ? reason.trim() : null));
        patientRepository.save(patient);

        return patient.getKycStatus();
    }

    /**
     * Get all patients with their profile data
     */
    public List<ProfileResponse> getAllPatients() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && 
                        user.getRole().getRoleName().name().equals("PATIENT"))
                .map(user -> {
                    ProfileResponse.ProfileResponseBuilder responseBuilder = ProfileResponse.builder()
                            .userId(user.getUserId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .cnic(user.getCnic())
                            .phoneNum(user.getPhoneNum())
                            .address(user.getAddress())
                            .city(user.getCity())
                            .bloodGroup(user.getBloodGroup())
                            .dateOfBirth(user.getDateOfBirth())
                            .role(user.getRole().getRoleName().name())
                            .status(user.getStatus() != null ? user.getStatus().name() : null);

                    // Add patient-specific data
                    Patient patient = patientRepository.findByUserId(user.getUserId()).orElse(null);
                    if (patient != null) {
                        UUID resolvedHospitalId = patient.getHospitalId() != null ? patient.getHospitalId() : user.getHospitalId();
                        responseBuilder
                                .patientId(patient.getId())
                                .walletAddress(patient.getWalletAddress())
                                .hasAsset(patient.getHasAsset())
                                .hasSubscription(patient.getHasSubscription())
                                .kycStatus(patient.getKycStatus() != null ? patient.getKycStatus().name() : null)
                            .kycSubmittedAt(patient.getKycSubmittedAt())
                            .kycReviewedAt(patient.getKycReviewedAt())
                            .kycReviewedBy(patient.getKycReviewedBy())
                            .kycRejectionReason(patient.getKycRejectionReason())
                            .kycDocumentFront(patient.getKycDocumentFront())
                            .kycDocumentBack(patient.getKycDocumentBack())
                            .kycSelfie(patient.getKycSelfie())
                            .registrationId(patient.getRegistrationId())
                            .hospitalId(resolvedHospitalId)
                            .hospitalName(resolveHospitalName(resolvedHospitalId));
                        enrichPatientFinancials(responseBuilder, patient);
                        } else if (user.getHospitalId() != null) {
                        responseBuilder
                            .hospitalId(user.getHospitalId())
                            .hospitalName(resolveHospitalName(user.getHospitalId()));
                    }

                    return responseBuilder.build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Get patients by hospital ID
     */
    public List<ProfileResponse> getPatientsByHospitalId(UUID hospitalId) {
        return patientRepository.findByHospitalId(hospitalId).stream()
                .map(patient -> {
                    User user = userRepository.findById(patient.getUserId()).orElse(null);
                    
                    if (user == null) {
                        return null;
                    }

                    return ProfileResponse.builder()
                            .userId(user.getUserId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .cnic(user.getCnic())
                            .phoneNum(user.getPhoneNum())
                            .address(user.getAddress())
                            .city(user.getCity())
                            .bloodGroup(user.getBloodGroup())
                            .dateOfBirth(user.getDateOfBirth())
                            .role(user.getRole().getRoleName().name())
                            .status(user.getStatus() != null ? user.getStatus().name() : null)
                            .patientId(patient.getId())
                            .walletAddress(patient.getWalletAddress())
                            .hasAsset(patient.getHasAsset())
                            .hasSubscription(patient.getHasSubscription())
                            .kycStatus(patient.getKycStatus() != null ? patient.getKycStatus().name() : null)
                            .kycSubmittedAt(patient.getKycSubmittedAt())
                            .kycReviewedAt(patient.getKycReviewedAt())
                            .kycReviewedBy(patient.getKycReviewedBy())
                            .kycRejectionReason(patient.getKycRejectionReason())
                            .kycDocumentFront(patient.getKycDocumentFront())
                            .kycDocumentBack(patient.getKycDocumentBack())
                            .kycSelfie(patient.getKycSelfie())
                            .registrationId(patient.getRegistrationId())
                            .hospitalId(patient.getHospitalId())
                            .hospitalName(resolveHospitalName(patient.getHospitalId()))
                                .totalAt(getPatientTotalAt(patient.getId()))
                                .totalHt(getPatientTotalHt(patient.getId()))
                                .totalAssets(getPatientApprovedAssetCount(patient.getId()))
                            .build();
                })
                .filter(profile -> profile != null)
                .collect(Collectors.toList());
    }

                    private void enrichPatientFinancials(ProfileResponse.ProfileResponseBuilder builder, Patient patient) {
                    builder
                        .totalAt(getPatientTotalAt(patient.getId()))
                        .totalHt(getPatientTotalHt(patient.getId()))
                        .totalAssets(getPatientApprovedAssetCount(patient.getId()));
                    }

                    private BigDecimal getPatientTotalAt(UUID patientId) {
                    return patientTokenBalanceRepository.findByPatientId(patientId)
                        .map(PatientTokenBalance::getTotalAt)
                        .filter(value -> value != null)
                        .orElse(BigDecimal.ZERO);
                    }

                    private BigDecimal getPatientTotalHt(UUID patientId) {
                    return patientTokenBalanceRepository.findByPatientId(patientId)
                        .map(PatientTokenBalance::getTotalHt)
                        .filter(value -> value != null)
                        .orElse(BigDecimal.ZERO);
                    }

                    private Integer getPatientApprovedAssetCount(UUID patientId) {
                    return (int) assetDepositRepository.findByPatientIdOrderBySubmittedAtDesc(patientId)
                        .stream()
                        .filter(asset -> asset.getBankApprovalStatus() != null
                            && "approved".equalsIgnoreCase(asset.getBankApprovalStatus()))
                        .count();
                    }

    private String resolveHospitalName(UUID hospitalId) {
        if (hospitalId == null) {
            return null;
        }
        return hospitalRepository.findById(hospitalId)
                .map(hospital -> hospital.getHospitalName())
                .orElse(null);
    }

    private void validateKycPrerequisites(User user) {
        StringBuilder missing = new StringBuilder();

        appendMissingField(missing, user.getCnic(), "CNIC");
        appendMissingField(missing, user.getPhoneNum(), "phone number");
        appendMissingField(missing, user.getAddress(), "address");
        appendMissingField(missing, user.getCity(), "city");

        if (user.getDateOfBirth() == null) {
            if (!missing.isEmpty()) {
                missing.append(", ");
            }
            missing.append("date of birth");
        }

        if (!missing.isEmpty()) {
            throw new RuntimeException("Complete your profile before submitting KYC. Missing: " + missing);
        }
    }

    private void appendMissingField(StringBuilder missing, String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            if (!missing.isEmpty()) {
                missing.append(", ");
            }
            missing.append(fieldName);
        }
    }
}
