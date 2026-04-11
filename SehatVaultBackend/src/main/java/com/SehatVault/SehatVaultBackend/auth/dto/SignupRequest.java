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
    private String cnic;  // CNIC is required for all signups
    private String phoneNum;
    private String address;
    private String city;
    private String bloodGroup;
    private String dateOfBirth;  // Format: YYYY-MM-DD
    private String role;  // patient (only patients can self-signup)
    private String hospitalName;  // Hospital name for patients
    private String bankName;  // Optional bank name for bank registration flow
    
    // Validation methods
    public boolean isValid() {
        return name != null && !name.isEmpty() &&
               email != null && !email.isEmpty() &&
               password != null && password.length() >= 6 &&
               cnic != null && !cnic.isEmpty() &&
               role != null && !role.isEmpty();
    }
}
