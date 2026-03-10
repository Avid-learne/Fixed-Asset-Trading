package com.SehatVault.SehatVaultBackend.activity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "act_id")
    private UUID actId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "activity_name", nullable = false)
    private String activityName;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ActivityType type;

    @Column(name = "status")
    private String status;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    public enum ActivityType {
        LOGIN,
        LOGOUT,
        ACTION,
        ERROR
    }
}
