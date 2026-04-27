package com.SehatVault.SehatVaultBackend.insurance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "requirement_id")
    private UUID requirementId;

    @Column(name = "document_type", nullable = false, unique = true)
    private String documentType;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory = true;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
