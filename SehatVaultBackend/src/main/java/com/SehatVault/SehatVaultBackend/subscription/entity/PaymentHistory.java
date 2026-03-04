package com.SehatVault.SehatVaultBackend.subscription.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * PaymentHistory Entity
 * Tracks subscription payment records
 */
@Entity
@Table(name = "payment_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "payment_id")
    private UUID paymentId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "subs_id", nullable = false)
    private UUID subsId;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "invoice_url", columnDefinition = "TEXT")
    private String invoiceUrl;

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private LocalDateTime timestamp;

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED
    }
}
