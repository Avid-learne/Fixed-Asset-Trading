package com.SehatVault.SehatVaultBackend.subscription.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * PatientSubscription Entity
 * Represents a patient's subscription to a health plan
 */
@Entity
@Table(name = "patient_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "subs_req_id")
    private UUID subsReqId;

    @Column(name = "subscription_id", nullable = false)
    private UUID subscriptionId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum SubscriptionStatus {
        ACTIVE, EXPIRED, CANCELLED
    }
}
