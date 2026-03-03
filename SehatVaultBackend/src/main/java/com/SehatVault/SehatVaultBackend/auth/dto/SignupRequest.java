package com.SehatVault.SehatVaultBackend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Sign Up Request DTO
 * Request body for user registration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    
    private String name;
    private String email;
    private String password;
    private String phoneNum;
    private String address;
    private String city;
    private String bloodGroup;
    private String dateOfBirth;  // Format: YYYY-MM-DD
    private String role;  // patient, hospital_admin, hospital_staff, bank_staff, admin
    
    // Validation methods
    public boolean isValid() {
        return name != null && !name.isEmpty() &&
               email != null && !email.isEmpty() &&
               password != null && password.length() >= 6 &&
               role != null && !role.isEmpty();
    }
}
