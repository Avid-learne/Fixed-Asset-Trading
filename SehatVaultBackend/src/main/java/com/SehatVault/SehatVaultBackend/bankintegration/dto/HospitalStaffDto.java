package com.SehatVault.SehatVaultBackend.bankintegration.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalStaffDto {
    private String userId;
    private String name;
    private String email;
    private String role;
}
