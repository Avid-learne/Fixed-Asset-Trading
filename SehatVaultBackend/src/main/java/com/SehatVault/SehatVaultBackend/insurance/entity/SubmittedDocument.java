package com.SehatVault.SehatVaultBackend.insurance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "submitted_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmittedDocument {

    public enum Status {
        SUBMITTED,
        VERIFIED,
        REJECTED,
        PENDING_REVIEW
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "document_id")
    private UUID documentId;

    @Column(name = "fractionalization_request_id", nullable = false)
    private UUID fractionalizationRequestId;

    @Column(name = "requirement_id", nullable = false)
    private UUID requirementId;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(name = "document_url", nullable = false, columnDefinition = "text")
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.PENDING_REVIEW;

    @Column(name = "verification_notes", columnDefinition = "text")
    private String verificationNotes;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}
