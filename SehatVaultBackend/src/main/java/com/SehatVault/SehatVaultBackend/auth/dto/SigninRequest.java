package com.SehatVault.SehatVaultBackend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Sign In Request DTO
 * Request body for user login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SigninRequest {
    
    private String email;
    private String password;
    
    // Validation methods
    public boolean isValid() {
        return email != null && !email.isEmpty() &&
               password != null && !password.isEmpty();
    }
}
