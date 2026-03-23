package com.SehatVault.SehatVaultBackend.hospital.service;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.hospital.dto.StaffMemberResponse;
import com.SehatVault.SehatVaultBackend.hospital.entity.HospitalStaff;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalStaffRepository;

import lombok.RequiredArgsConstructor;

/**
 * HospitalStaff Service
 * Handles hospital staff management operations
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HospitalStaffService {
    
    private final HospitalStaffRepository hospitalStaffRepository;
    
    /**
     * Get all staff members for a hospital
     */
    public List<StaffMemberResponse> getStaffByHospitalId(UUID hospitalId) {
        try {
            List<HospitalStaff> staffMembers = hospitalStaffRepository.findByHospital_Id(hospitalId);
            return staffMembers.stream()
                    .map(this::toStaffMemberResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching staff members: " + e.getMessage());
        }
    }
    
    /**
     * Get all staff members for a hospital by status
     */
    public List<StaffMemberResponse> getStaffByHospitalIdAndStatus(UUID hospitalId, String status) {
        try {
            List<HospitalStaff> staffMembers = hospitalStaffRepository.findByHospital_Id(hospitalId);
            
            return staffMembers.stream()
                    .filter(staff -> {
                        User user = staff.getUser();
                        return user != null && user.getStatus() != null && 
                               user.getStatus().toString().equalsIgnoreCase(status);
                    })
                    .map(this::toStaffMemberResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching staff members by status: " + e.getMessage());
        }
    }
    
    /**
     * Get a specific staff member by ID
     */
    public StaffMemberResponse getStaffById(UUID staffId) {
        try {
            HospitalStaff staff = hospitalStaffRepository.findById(staffId)
                    .orElseThrow(() -> new RuntimeException("Staff member not found"));
            return toStaffMemberResponse(staff);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching staff member: " + e.getMessage());
        }
    }
    
    /**
     * Get staff count for a hospital
     */
    public long getStaffCountByHospitalId(UUID hospitalId) {
        try {
            return hospitalStaffRepository.findByHospital_Id(hospitalId).stream()
                    .filter(staff -> staff.getUser() != null && 
                           User.UserStatus.ACTIVE.equals(staff.getUser().getStatus()))
                    .count();
        } catch (Exception e) {
            throw new RuntimeException("Error counting staff: " + e.getMessage());
        }
    }
    
    /**
     * Get all hospital staff members (users with role role_id = 'hospital_staff') for a hospital
     * This filters from the users table by role
     */
    public List<StaffMemberResponse> getHospitalStaffByHospitalId(UUID hospitalId) {
        try {
            List<HospitalStaff> staffMembers = hospitalStaffRepository.findByHospitalIdAndUserRole(
                    hospitalId, 
                    Role.RoleType.hospital_staff
            );
            return staffMembers.stream()
                    .map(this::toStaffMemberResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching hospital staff members: " + e.getMessage());
        }
    }
    
    /**
     * Get hospital staff members with optional status filter
     * Returns users with role_id = 'hospital_staff' and optionally filtered by status
     */
    public List<StaffMemberResponse> getHospitalStaffByHospitalIdAndStatus(UUID hospitalId, String status) {
        try {
            List<HospitalStaff> staffMembers = hospitalStaffRepository.findByHospitalIdAndUserRoleIgnoringStatus(
                    hospitalId,
                    Role.RoleType.hospital_staff
            );
            
            return staffMembers.stream()
                    .filter(staff -> {
                        User user = staff.getUser();
                        return user != null && user.getStatus() != null && 
                               user.getStatus().toString().equalsIgnoreCase(status);
                    })
                    .map(this::toStaffMemberResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching hospital staff members by status: " + e.getMessage());
        }
    }
    
    /**
     * Get count of hospital staff members (role_id = 'hospital_staff') for a hospital
     */
    public long getHospitalStaffCountByHospitalId(UUID hospitalId) {
        try {
            return hospitalStaffRepository.findByHospitalIdAndUserRole(
                    hospitalId,
                    Role.RoleType.hospital_staff
            ).stream()
                    .filter(staff -> staff.getUser() != null && 
                           User.UserStatus.ACTIVE.equals(staff.getUser().getStatus()))
                    .count();
        } catch (Exception e) {
            throw new RuntimeException("Error counting hospital staff: " + e.getMessage());
        }
    }
    
    /**
     * Convert HospitalStaff entity to StaffMemberResponse DTO
     */
    private StaffMemberResponse toStaffMemberResponse(HospitalStaff staff) {
        User user = staff.getUser();
        
        String roleName = "Staff";
        if (user.getRole() != null && user.getRole().getRoleName() != null) {
            roleName = formatRoleName(user.getRole().getRoleName().toString());
        }
        
        String status = "inactive";
        if (user.getStatus() != null) {
            status = user.getStatus().toString().toLowerCase();
        }
        
        return new StaffMemberResponse(
                staff.getId(),
                user.getName() != null ? user.getName() : "Unknown",
                user.getEmail() != null ? user.getEmail() : "",
                user.getPhoneNum() != null ? user.getPhoneNum() : "",
                roleName,
                status,
                user.getCreatedAt(),
                user.getUpdatedAt(),
                staff.getPosition() != null ? staff.getPosition() : "",
                staff.getDepartment() != null ? staff.getDepartment() : ""
        );
    }
    
    /**
     * Format role name from enum to readable string
     */
    private String formatRoleName(String roleEnum) {
        String formatted = roleEnum.replace("_", " ");
        Pattern pattern = Pattern.compile("\\b([a-z])");
        Matcher matcher = pattern.matcher(formatted);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            matcher.appendReplacement(sb, matcher.group(1).toUpperCase());
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}
