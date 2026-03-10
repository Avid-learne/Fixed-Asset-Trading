package com.SehatVault.SehatVaultBackend.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Profile Update Request DTO
 * Used for updating user profile information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    
    private String name;
    private String phoneNum;
    private String address;
    private String city;
    private String bloodGroup;
    private String dateOfBirth;
    
    public boolean hasValidName() {
        return name != null && !name.trim().isEmpty();
    }
    
    public boolean hasValidPhoneNum() {
        return phoneNum != null && !phoneNum.trim().isEmpty();
    }
}
