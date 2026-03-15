package com.SehatVault.SehatVaultBackend.hospital.service;

import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.Settings;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.SettingsRepository;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.hospital.dto.HospitalAdminSettingsResponse;
import com.SehatVault.SehatVaultBackend.hospital.dto.UpdateHospitalAdminSettingsRequest;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalAdminSettingsService {

    private final UserRepository userRepository;
    private final SettingsRepository settingsRepository;
    private final HospitalRepository hospitalRepository;

    @Transactional(readOnly = true)
    public HospitalAdminSettingsResponse getSettingsByEmail(String email) {
        User user = findHospitalAdminByEmail(email);
        UUID hospitalId = user.getHospitalId();

        if (hospitalId == null) {
            throw new IllegalArgumentException("Hospital is not linked to this account");
        }

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found for linked hospitalId"));

        Settings settings = settingsRepository.findByUser(user)
                .orElseGet(() -> {
                    Settings created = new Settings();
                    created.setUser(user);
                    created.setMultiFactorEnabled(Boolean.FALSE);
                    created.setNotificationEnabled(Boolean.TRUE);
                    created.setEmailVerified(Boolean.FALSE);
                    return settingsRepository.save(created);
                });

        return toResponse(user, hospital, settings);
    }

    @Transactional
    public HospitalAdminSettingsResponse updateSettingsByEmail(String email, UpdateHospitalAdminSettingsRequest request) {
        User user = findHospitalAdminByEmail(email);
        UUID hospitalId = user.getHospitalId();

        if (hospitalId == null) {
            throw new IllegalArgumentException("Hospital is not linked to this account");
        }

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found for linked hospitalId"));

        if (request.getHospitalName() != null) {
            hospital.setHospitalName(clean(request.getHospitalName()));
        }
        if (request.getHospitalCode() != null) {
            hospital.setCode(clean(request.getHospitalCode()));
        }
        if (request.getContactEmail() != null) {
            hospital.setEmail(clean(request.getContactEmail()));
        }
        if (request.getContactPhone() != null) {
            hospital.setContactNum(clean(request.getContactPhone()));
        }
        if (request.getAddress() != null) {
            hospital.setAddress(clean(request.getAddress()));
        }
        if (request.getCity() != null) {
            hospital.setCity(clean(request.getCity()));
        }
        hospitalRepository.save(hospital);

        if (request.getAdminName() != null) {
            user.setName(clean(request.getAdminName()));
        }
        if (request.getAdminPhone() != null) {
            user.setPhoneNum(clean(request.getAdminPhone()));
        }
        if (request.getMfaEnabled() != null) {
            user.setMfaEnabled(request.getMfaEnabled());
        }
        userRepository.save(user);

        Settings settings = settingsRepository.findByUser(user)
                .orElseGet(() -> {
                    Settings created = new Settings();
                    created.setUser(user);
                    created.setMultiFactorEnabled(Boolean.FALSE);
                    created.setNotificationEnabled(Boolean.TRUE);
                    created.setEmailVerified(Boolean.FALSE);
                    return created;
                });

        if (request.getMfaEnabled() != null) {
            settings.setMultiFactorEnabled(request.getMfaEnabled());
        }
        if (request.getNotificationEnabled() != null) {
            settings.setNotificationEnabled(request.getNotificationEnabled());
        }

        settings = settingsRepository.save(settings);
        return toResponse(user, hospital, settings);
    }

    private User findHospitalAdminByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == null || user.getRole().getRoleName() != Role.RoleType.hospital_admin) {
            throw new IllegalArgumentException("Only hospital admin can access these settings");
        }

        return user;
    }

    private HospitalAdminSettingsResponse toResponse(User user, Hospital hospital, Settings settings) {
        HospitalAdminSettingsResponse response = new HospitalAdminSettingsResponse();
        response.setHospitalId(hospital.getHospitalId());
        response.setHospitalName(hospital.getHospitalName());
        response.setHospitalCode(hospital.getCode());
        response.setRegistrationNum(hospital.getRegistrationNum());
        response.setContactEmail(hospital.getEmail());
        response.setContactPhone(hospital.getContactNum());
        response.setAddress(hospital.getAddress());
        response.setCity(hospital.getCity());
        response.setVerificationStatus(hospital.getVerificationStatus() != null ? hospital.getVerificationStatus().name() : null);

        response.setTotalAssets(hospital.getTotalAssets());
        response.setTotalAT(hospital.getTotalAT());
        response.setTotalPatients(hospital.getTotalPatients());

        response.setAdminName(user.getName());
        response.setAdminEmail(user.getEmail());
        response.setAdminPhone(user.getPhoneNum());

        response.setMfaEnabled(user.getMfaEnabled() != null ? user.getMfaEnabled() : Boolean.FALSE);
        response.setNotificationEnabled(settings.getNotificationEnabled() != null ? settings.getNotificationEnabled() : Boolean.TRUE);
        response.setEmailVerified(settings.getEmailVerified() != null ? settings.getEmailVerified() : Boolean.FALSE);
        return response;
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }
}
