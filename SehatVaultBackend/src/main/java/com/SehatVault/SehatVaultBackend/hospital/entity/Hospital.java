package com.SehatVault.SehatVaultBackend.hospital.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Hospital Entity
 * Maps to the 'hospitals' table in Supabase
 */
@Entity
@Table(name = "hospitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hospital {
    
    @Id
    @Column(name = "h_id")
    private UUID hospitalId;
    
    @Column(name = "hospital_name", nullable = false)
    private String hospitalName;
    
    @Column(name = "registration_num", nullable = false, unique = true)
    private String registrationNum;
    
    @Column(name = "address", nullable = false)
    private String address;
    
    @Column(name = "contact_num", nullable = false)
    private String contactNum;
    
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @Column(name = "code")
    private String code;
    
    @Column(name = "city")
    private String city;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    
    @Column(name = "total_assets")
    private Double totalAssets = 0.0;
    
    @Column(name = "total_at")
    private Double totalAT = 0.0;
    
    @Column(name = "total_patients")
    private Integer totalPatients = 0;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED
    }
}
