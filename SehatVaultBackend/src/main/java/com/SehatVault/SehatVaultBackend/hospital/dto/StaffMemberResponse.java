package com.SehatVault.SehatVaultBackend.hospital.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * StaffMember Response DTO
 * Used to return staff member information for hospital admin portal
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffMemberResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    private String joinDate;
    private String lastLogin;
    private String position;
    private String department;
    
    /**
     * Constructor from database data
     */
    public StaffMemberResponse(UUID id, String name, String email, String phone, 
                              String role, String status, LocalDateTime joinDate, 
                              LocalDateTime lastLogin, String position, String department) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.status = status;
        this.joinDate = joinDate != null ? joinDate.toString() : null;
        this.lastLogin = lastLogin != null ? lastLogin.toString() : null;
        this.position = position;
        this.department = department;
    }
}
