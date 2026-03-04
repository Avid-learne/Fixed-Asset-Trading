package com.SehatVault.SehatVaultBackend.patient.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Patient Entity
 * Represents patient information linked to a user account
 */
@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @Column(name = "wallet_address")
    private String walletAddress;

    @Column(name = "has_asset")
    private Boolean hasAsset = false;

    @Column(name = "has_subscription")
    private Boolean hasSubscription = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status")
    private KycStatus kycStatus = KycStatus.PENDING;

    @Column(name = "registration_id", unique = true)
    private String registrationId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum KycStatus {
        PENDING, IN_PROGRESS, APPROVED, REJECTED
    }
}
