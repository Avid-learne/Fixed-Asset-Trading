package com.SehatVault.SehatVaultBackend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * Auth Response DTO
 * Response body for signup/signin requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private UUID userId;
    private String name;
    private String email;
    private String role;
    private String token;
    private String phoneNum;
    private String address;
    private String city;
    private String bloodGroup;
    private String dateOfBirth;
    private UUID hospitalId;
    private String hospitalName;
    private boolean success;
    private String message;
    
    // Constructor for success response
    public AuthResponse(UUID userId, String name, String email, String role, String token) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
        this.success = true;
        this.message = "Authentication successful";
    }
    
    // Constructor for error response
    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
