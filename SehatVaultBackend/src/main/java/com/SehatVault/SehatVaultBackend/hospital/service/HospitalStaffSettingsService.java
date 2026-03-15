package com.SehatVault.SehatVaultBackend.hospital.service;

import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.Settings;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.SettingsRepository;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.hospital.dto.HospitalStaffActivityItemDto;
import com.SehatVault.SehatVaultBackend.hospital.dto.HospitalStaffSettingsResponse;
import com.SehatVault.SehatVaultBackend.hospital.dto.UpdateHospitalStaffSettingsRequest;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalStaffSettingsService {

    private final UserRepository userRepository;
    private final SettingsRepository settingsRepository;
    private final HospitalRepository hospitalRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public HospitalStaffSettingsResponse getSettingsByEmail(String email) {
        User user = findHospitalStaffByEmail(email);
        Settings settings = getOrCreateSettings(user);
        Hospital hospital = findHospital(user.getHospitalId());
        List<HospitalStaffActivityItemDto> activity = getActivity(user.getUserId());
        return toResponse(user, settings, hospital, activity);
    }

    @Transactional
    public HospitalStaffSettingsResponse updateSettingsByEmail(String email, UpdateHospitalStaffSettingsRequest request) {
        User user = findHospitalStaffByEmail(email);

        if (request.getStaffName() != null) {
            user.setName(clean(request.getStaffName()));
        }
        if (request.getPhone() != null) {
            user.setPhoneNum(clean(request.getPhone()));
        }
        if (request.getAddress() != null) {
            user.setAddress(clean(request.getAddress()));
        }
        if (request.getCity() != null) {
            user.setCity(clean(request.getCity()));
        }
        if (request.getBloodGroup() != null) {
            user.setBloodGroup(clean(request.getBloodGroup()));
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(parseDate(request.getDateOfBirth()));
        }
        if (request.getMfaEnabled() != null) {
            user.setMfaEnabled(request.getMfaEnabled());
        }
        user = userRepository.save(user);

        Settings settings = getOrCreateSettings(user);
        if (request.getMfaEnabled() != null) {
            settings.setMultiFactorEnabled(request.getMfaEnabled());
        }
        if (request.getNotificationEnabled() != null) {
            settings.setNotificationEnabled(request.getNotificationEnabled());
        }
        settings = settingsRepository.save(settings);

        Hospital hospital = findHospital(user.getHospitalId());
        List<HospitalStaffActivityItemDto> activity = getActivity(user.getUserId());
        return toResponse(user, settings, hospital, activity);
    }

    private User findHospitalStaffByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == null || user.getRole().getRoleName() != Role.RoleType.hospital_staff) {
            throw new IllegalArgumentException("Only hospital staff can access these settings");
        }

        return user;
    }

    private Settings getOrCreateSettings(User user) {
        return settingsRepository.findByUser(user)
                .orElseGet(() -> {
                    Settings created = new Settings();
                    created.setUser(user);
                    created.setMultiFactorEnabled(user.getMfaEnabled() != null ? user.getMfaEnabled() : Boolean.FALSE);
                    created.setNotificationEnabled(Boolean.TRUE);
                    created.setEmailVerified(Boolean.FALSE);
                    return settingsRepository.save(created);
                });
    }

    private Hospital findHospital(UUID hospitalId) {
        if (hospitalId == null) {
            return null;
        }

        return hospitalRepository.findById(hospitalId).orElse(null);
    }

    private List<HospitalStaffActivityItemDto> getActivity(UUID userId) {
        List<ActivityLog> logs = activityLogRepository.findTop100ByUserIdOrderByTimestampDesc(userId);
        return logs.stream().limit(20).map(this::toActivityDto).toList();
    }

    private HospitalStaffActivityItemDto toActivityDto(ActivityLog log) {
        HospitalStaffActivityItemDto dto = new HospitalStaffActivityItemDto();
        dto.setActivityId(log.getActId() != null ? log.getActId().toString() : null);
        dto.setActivityName(log.getActivityName());
        dto.setDescription(log.getDescription());
        dto.setType(log.getType() != null ? log.getType().name() : null);
        dto.setStatus(log.getStatus());
        dto.setIpAddress(log.getIpAddress());
        dto.setTimestamp(log.getTimestamp() != null ? log.getTimestamp().toString() : null);
        return dto;
    }

    private HospitalStaffSettingsResponse toResponse(
            User user,
            Settings settings,
            Hospital hospital,
            List<HospitalStaffActivityItemDto> activity
    ) {
        HospitalStaffSettingsResponse response = new HospitalStaffSettingsResponse();
        response.setUserId(user.getUserId());
        response.setStaffName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhoneNum());
        response.setAddress(user.getAddress());
        response.setCity(user.getCity());
        response.setBloodGroup(user.getBloodGroup());
        response.setDateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
        response.setRole(user.getRole() != null && user.getRole().getRoleName() != null
                ? user.getRole().getRoleName().name()
                : null);
        response.setUserStatus(user.getStatus() != null ? user.getStatus().name() : null);

        response.setHospitalId(user.getHospitalId());
        response.setHospitalName(hospital != null ? hospital.getHospitalName() : null);

        response.setMfaEnabled(user.getMfaEnabled() != null ? user.getMfaEnabled() : Boolean.FALSE);
        response.setNotificationEnabled(settings.getNotificationEnabled() != null
                ? settings.getNotificationEnabled()
                : Boolean.TRUE);
        response.setEmailVerified(settings.getEmailVerified() != null ? settings.getEmailVerified() : Boolean.FALSE);
        response.setRecentActivity(activity);

        return response;
    }

    private String clean(String value) {
        return value == null ? null : value.trim();
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid dateOfBirth format. Use yyyy-MM-dd");
        }
    }
}
