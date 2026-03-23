package com.SehatVault.SehatVaultBackend.hospital.entity;

import com.SehatVault.SehatVaultBackend.auth.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * HospitalStaff Entity
 * Maps to the 'hospital_staff' table in database
 */
@Entity
@Table(name = "hospital_staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalStaff {
    
    @Id
    @Column(name = "id")
    private UUID id = UUID.randomUUID();
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;
    
    @Column(name = "employee_id", nullable = false, unique = true)
    private String employeeId;
    
    @Column(name = "department")
    private String department;
    
    @Column(name = "position")
    private String position;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
