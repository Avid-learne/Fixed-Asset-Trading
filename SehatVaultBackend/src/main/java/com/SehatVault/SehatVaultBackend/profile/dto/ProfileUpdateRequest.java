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
    private String cnic;
    private String gender;
    private String nationality;
    private String cnicIssueDate;
    private String cnicExpiryDate;
    private String phoneNum;
    private String address;
    private String city;
    private String country;
    private String postalCode;
    private String bloodGroup;
    private String occupation;
    private String sourceOfIncome;
    private String healthIssues;
    private String dateOfBirth;
    private String kycDocumentFront;
    private String kycDocumentBack;
    private String kycSelfie;
    
    public boolean hasValidName() {
        return name != null && !name.trim().isEmpty();
    }
    
    public boolean hasValidPhoneNum() {
        return phoneNum != null && !phoneNum.trim().isEmpty();
    }
}
