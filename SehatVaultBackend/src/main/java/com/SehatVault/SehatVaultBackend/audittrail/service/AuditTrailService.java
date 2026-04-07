package com.SehatVault.SehatVaultBackend.audittrail.service;

import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import com.SehatVault.SehatVaultBackend.activity.repository.ActivityLogRepository;
import com.SehatVault.SehatVaultBackend.audittrail.dto.AuditTrailLogDto;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditTrailService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    /**
     * Get audit logs for all patients belonging to the hospital of the authenticated user.
     */
    @Transactional(readOnly = true)
    public List<AuditTrailLogDto> getPatientLogs(UUID hospitalId, int limit) {
        List<User> patients = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null
                        && u.getRole().getRoleName() == Role.RoleType.patient
                        && hospitalId.equals(u.getHospitalId()))
                .toList();

        return fetchLogsForUsers(patients, limit);
    }

    /**
     * Get audit logs for all hospital staff and hospital admin belonging to the same hospital.
     */
    @Transactional(readOnly = true)
    public List<AuditTrailLogDto> getHospitalLogs(UUID hospitalId, int limit) {
        Set<Role.RoleType> hospitalRoles = Set.of(Role.RoleType.hospital_staff, Role.RoleType.hospital_admin);

        List<User> staff = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null
                        && hospitalRoles.contains(u.getRole().getRoleName())
                        && hospitalId.equals(u.getHospitalId()))
                .toList();

        return fetchLogsForUsers(staff, limit);
    }

    private List<AuditTrailLogDto> fetchLogsForUsers(List<User> users, int limit) {
        if (users.isEmpty()) {
            return Collections.emptyList();
        }

        Map<UUID, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));

        List<UUID> userIds = users.stream().map(User::getUserId).toList();

        List<ActivityLog> logs = activityLogRepository.findByUserIdInOrderByTimestampDesc(userIds);

        return logs.stream()
                .limit(limit)
                .map(log -> {
                    User user = userMap.get(log.getUserId());
                    String userName = user != null ? user.getName() : "Unknown";
                    String userRole = user != null && user.getRole() != null
                            ? user.getRole().getRoleName().name()
                            : "unknown";

                    return new AuditTrailLogDto(
                            log.getActId().toString(),
                            log.getActivityName(),
                            log.getDescription(),
                            log.getType() != null ? log.getType().name() : "ACTION",
                            log.getStatus(),
                            log.getIpAddress(),
                            log.getTimestamp() != null ? log.getTimestamp().toString() : null,
                            log.getUserId().toString(),
                            userName,
                            userRole
                    );
                })
                .toList();
    }
}
