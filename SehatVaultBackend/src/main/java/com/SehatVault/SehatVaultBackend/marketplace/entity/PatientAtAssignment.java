package com.SehatVault.SehatVaultBackend.marketplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * PatientAtAssignment entity - Tracks AT assigned to patients and their
 * availability status.
 * Mapped to patient_at_assignments table.
 */
@Entity
@Table(name = "patient_at_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAtAssignment {

    public enum AvailabilityStatus {
        AVAILABLE, // AT not used in any trade
        UNAVAILABLE // AT actively used in a trade
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "total_at_assigned", nullable = false)
    @lombok.Builder.Default
    private BigDecimal totalAtAssigned = BigDecimal.ZERO;

    @Column(name = "available_at", nullable = false)
    @lombok.Builder.Default
    private BigDecimal availableAt = BigDecimal.ZERO;

    @Column(name = "unavailable_at", nullable = false)
    @lombok.Builder.Default
    private BigDecimal unavailableAt = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false)
    @lombok.Builder.Default
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public BigDecimal getMonetaryValue(BigDecimal atPrice) {
        return totalAtAssigned.multiply(atPrice);
    }

    public BigDecimal getAvailableMonetaryValue(BigDecimal atPrice) {
        return availableAt.multiply(atPrice);
    }

    public BigDecimal getUnavailableMonetaryValue(BigDecimal atPrice) {
        return unavailableAt.multiply(atPrice);
    }
}
