package com.SehatVault.SehatVaultBackend.insurance.service;

import com.SehatVault.SehatVaultBackend.insurance.dto.*;
import com.SehatVault.SehatVaultBackend.insurance.entity.*;
import com.SehatVault.SehatVaultBackend.insurance.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InsuranceService {

    private final InsuranceCompanyRepository insuranceCompanyRepository;
    private final NocCertificateRepository nocCertificateRepository;
    private final DocumentRequirementRepository documentRequirementRepository;
    private final SubmittedDocumentRepository submittedDocumentRepository;

    /**
     * Check document completion status for a fractionalization request
     */
    public DocumentStatusResponseDto checkDocumentStatus(UUID fractionalizationRequestId, UUID patientId, UUID hospitalId) {
        log.info("Checking document status for request: {}", fractionalizationRequestId);

        // Get all mandatory document requirements
        List<DocumentRequirement> mandatoryDocs = documentRequirementRepository
                .findByIsActiveAndIsMandatory(true, true);

        // Get all submitted documents for this request
        List<SubmittedDocument> submittedDocs = submittedDocumentRepository
                .findByFractionalizationRequestId(fractionalizationRequestId);

        // Map submitted documents to DTOs
        List<DocumentStatusDto> documentStatuses = submittedDocs.stream()
                .map(doc -> new DocumentStatusDto(
                        doc.getDocumentId(),
                        doc.getDocumentType(),
                        doc.getStatus().toString(),
                        doc.getDocumentUrl(),
                        doc.getVerificationNotes(),
                        doc.getSubmittedAt(),
                        doc.getVerifiedAt()
                ))
                .collect(Collectors.toList());

        // Count verified documents
        long verifiedCount = submittedDocs.stream()
                .filter(doc -> doc.getStatus() == SubmittedDocument.Status.VERIFIED)
                .count();

        long rejectedCount = submittedDocs.stream()
                .filter(doc -> doc.getStatus() == SubmittedDocument.Status.REJECTED)
                .count();

        // Check if all mandatory documents are verified
        boolean allComplete = verifiedCount >= mandatoryDocs.size() && rejectedCount == 0;

        DocumentStatusResponseDto response = new DocumentStatusResponseDto();
        response.setAllDocumentsComplete(allComplete);
        response.setTotalRequiredDocuments(mandatoryDocs.size());
        response.setSubmittedDocuments((int) submittedDocs.stream()
                .filter(doc -> doc.getStatus() != SubmittedDocument.Status.PENDING_REVIEW)
                .count());
        response.setVerifiedDocuments((int) verifiedCount);
        response.setRejectedDocuments((int) rejectedCount);
        response.setDocuments(documentStatuses);

        log.info("Document status check completed. All complete: {}", allComplete);
        return response;
    }

    /**
     * Issue NOC certificate if all documents are complete
     */
    @Transactional
    public NocCertificateDto issueNocCertificate(IssueNocCertificateRequest request, UUID insuranceCompanyId) {
        log.info("Issuing NOC certificate for request: {}", request.getFractionalizationRequestId());

        // Check document status first
        DocumentStatusResponseDto docStatus = checkDocumentStatus(
                request.getFractionalizationRequestId(),
                request.getPatientId(),
                request.getHospitalId()
        );

        if (!docStatus.getAllDocumentsComplete()) {
            throw new IllegalArgumentException(
                    "Cannot issue NOC: Not all mandatory documents are verified. " +
                    "Verified: " + docStatus.getVerifiedDocuments() +
                    ", Required: " + docStatus.getTotalRequiredDocuments()
            );
        }

        // Check if NOC already exists for this request
        Optional<NocCertificate> existingNoc = nocCertificateRepository
                .findByFractionalizationRequestId(request.getFractionalizationRequestId());

        if (existingNoc.isPresent()) {
            throw new IllegalArgumentException("NOC certificate already exists for this request");
        }

        // Generate NOC number
        String nocNumber = generateNocNumber(insuranceCompanyId);

        // Create NOC certificate
        NocCertificate noc = new NocCertificate();
        noc.setNocNumber(nocNumber);
        noc.setFractionalizationRequestId(request.getFractionalizationRequestId());
        noc.setInsuranceCompanyId(insuranceCompanyId);
        noc.setHospitalId(request.getHospitalId());
        noc.setPatientId(request.getPatientId());
        noc.setStatus(NocCertificate.Status.ISSUED);
        noc.setIssuedAt(LocalDateTime.now());

        // Set expiry date based on validity days (default 365)
        int validityDays = request.getValidityDays() != null ? request.getValidityDays() : 365;
        noc.setExpiresAt(LocalDateTime.now().plusDays(validityDays));

        noc.setRemarks(request.getRemarks());
        // In production, generate actual PDF/document
        noc.setDocumentUrl("https://sehatvault.com/noc/" + nocNumber + ".pdf");

        NocCertificate savedNoc = nocCertificateRepository.save(noc);

        log.info("NOC certificate issued successfully: {}", nocNumber);

        return mapToDto(savedNoc);
    }

    /**
     * Verify a document for a fractionalization request
     */
    @Transactional
    public DocumentStatusDto verifyDocument(UUID documentId, String verificationNotes) {
        log.info("Verifying document: {}", documentId);

        SubmittedDocument doc = submittedDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        doc.setStatus(SubmittedDocument.Status.VERIFIED);
        doc.setVerificationNotes(verificationNotes);
        doc.setVerifiedAt(LocalDateTime.now());

        SubmittedDocument saved = submittedDocumentRepository.save(doc);

        log.info("Document verified: {}", documentId);

        return new DocumentStatusDto(
                saved.getDocumentId(),
                saved.getDocumentType(),
                saved.getStatus().toString(),
                saved.getDocumentUrl(),
                saved.getVerificationNotes(),
                saved.getSubmittedAt(),
                saved.getVerifiedAt()
        );
    }

    /**
     * Reject a document
     */
    @Transactional
    public DocumentStatusDto rejectDocument(UUID documentId, String rejectionReason) {
        log.info("Rejecting document: {}", documentId);

        SubmittedDocument doc = submittedDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        doc.setStatus(SubmittedDocument.Status.REJECTED);
        doc.setVerificationNotes(rejectionReason);
        doc.setVerifiedAt(LocalDateTime.now());

        SubmittedDocument saved = submittedDocumentRepository.save(doc);

        log.info("Document rejected: {}", documentId);

        return new DocumentStatusDto(
                saved.getDocumentId(),
                saved.getDocumentType(),
                saved.getStatus().toString(),
                saved.getDocumentUrl(),
                saved.getVerificationNotes(),
                saved.getSubmittedAt(),
                saved.getVerifiedAt()
        );
    }

    /**
     * Get NOC certificate by fractionalization request ID
     */
    public NocCertificateDto getNocCertificate(UUID fractionalizationRequestId) {
        log.info("Getting NOC certificate for request: {}", fractionalizationRequestId);

        NocCertificate noc = nocCertificateRepository
                .findByFractionalizationRequestId(fractionalizationRequestId)
                .orElseThrow(() -> new RuntimeException("NOC certificate not found"));

        return mapToDto(noc);
    }

    /**
     * Get all NOC certificates for a patient
     */
    public List<NocCertificateDto> getPatientNocCertificates(UUID patientId) {
        log.info("Getting NOC certificates for patient: {}", patientId);

        return nocCertificateRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Revoke NOC certificate
     */
    @Transactional
    public NocCertificateDto revokeNocCertificate(UUID nocId, String reason) {
        log.info("Revoking NOC certificate: {}", nocId);

        NocCertificate noc = nocCertificateRepository.findById(nocId)
                .orElseThrow(() -> new RuntimeException("NOC certificate not found"));

        noc.setStatus(NocCertificate.Status.REVOKED);
        noc.setRemarks((noc.getRemarks() != null ? noc.getRemarks() + "; " : "") + "REVOKED: " + reason);

        NocCertificate saved = nocCertificateRepository.save(noc);

        log.info("NOC certificate revoked: {}", nocId);

        return mapToDto(saved);
    }

    /**
     * Get mandatory document requirements
     */
    public List<DocumentRequirement> getMandatoryDocumentRequirements() {
        return documentRequirementRepository.findByIsActiveAndIsMandatory(true, true);
    }

    // Helper methods

    private String generateNocNumber(UUID insuranceCompanyId) {
        // Format: NOC-{YYYY}{MM}{DD}-{INSURANCE_CODE}-{RANDOM}
        LocalDateTime now = LocalDateTime.now();
        String datePart = String.format("%04d%02d%02d", now.getYear(), now.getMonthValue(), now.getDayOfMonth());
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String insuranceCode = insuranceCompanyId.toString().substring(0, 4).toUpperCase();

        return "NOC-" + datePart + "-" + insuranceCode + "-" + randomPart;
    }

    private NocCertificateDto mapToDto(NocCertificate noc) {
        return new NocCertificateDto(
                noc.getNocId(),
                noc.getNocNumber(),
                noc.getFractionalizationRequestId(),
                noc.getStatus().toString(),
                noc.getIssuedAt(),
                noc.getExpiresAt(),
                noc.getDocumentUrl(),
                noc.getRemarks(),
                noc.getCreatedAt()
        );
    }
}
