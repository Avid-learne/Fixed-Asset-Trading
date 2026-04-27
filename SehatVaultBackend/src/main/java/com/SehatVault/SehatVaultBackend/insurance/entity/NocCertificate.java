package com.SehatVault.SehatVaultBackend.insurance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "noc_certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NocCertificate {

    public enum Status {
        ISSUED,
        EXPIRED,
        REVOKED,
        PENDING
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "noc_id")
    private UUID nocId;

    @Column(name = "noc_number", nullable = false, unique = true)
    private String nocNumber;

    @Column(name = "fractionalization_request_id", nullable = false)
    private UUID fractionalizationRequestId;

    @Column(name = "insurance_company_id", nullable = false)
    private UUID insuranceCompanyId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.PENDING;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "document_url", columnDefinition = "text")
    private String documentUrl;

    @Column(name = "remarks", columnDefinition = "text")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
