package com.SehatVault.SehatVaultBackend.insurance.repository;

import com.SehatVault.SehatVaultBackend.insurance.entity.SubmittedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmittedDocumentRepository extends JpaRepository<SubmittedDocument, UUID> {
    List<SubmittedDocument> findByFractionalizationRequestId(UUID fractionalizationRequestId);
    Optional<SubmittedDocument> findByFractionalizationRequestIdAndRequirementId(UUID fractionalizationRequestId, UUID requirementId);
    List<SubmittedDocument> findByFractionalizationRequestIdAndStatus(UUID fractionalizationRequestId, SubmittedDocument.Status status);
}
