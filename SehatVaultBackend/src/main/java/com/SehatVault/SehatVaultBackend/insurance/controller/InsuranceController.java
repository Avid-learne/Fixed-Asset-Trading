package com.SehatVault.SehatVaultBackend.insurance.controller;

import com.SehatVault.SehatVaultBackend.insurance.dto.IssueNocCertificateRequest;
import com.SehatVault.SehatVaultBackend.insurance.dto.NocCertificateDto;
import com.SehatVault.SehatVaultBackend.insurance.service.InsuranceService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/insurance")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
@Slf4j
public class InsuranceController {

    private final InsuranceService insuranceService;

    /**
     * Issue NOC certificate if documents are complete
     * POST /api/insurance/noc/issue
     * Request body: {
     *   "fractionalizationRequestId": "uuid",
     *   "patientId": "uuid",
     *   "hospitalId": "uuid",
     *   "validityDays": 365,
     *   "remarks": "Optional remarks"
     * }
     */
    @PostMapping("/noc/issue")
    public ResponseEntity<ApiResponse<NocCertificateDto>> issueNocCertificate(
            @RequestBody IssueNocCertificateRequest request,
            Authentication authentication
    ) {
        log.info("API Request: Issue NOC certificate for request: {}", request.getFractionalizationRequestId());

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Unauthorized"));
        }

        try {
            // For now, use a hardcoded insurance company ID (in production, derive from authentication)
            UUID insuranceCompanyId = UUID.fromString("00000000-0000-0000-0000-000000000001");

            NocCertificateDto noc = insuranceService.issueNocCertificate(request, insuranceCompanyId);
            return ResponseEntity.ok(ApiResponse.success(noc));
        } catch (IllegalArgumentException e) {
            log.warn("Cannot issue NOC: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error issuing NOC certificate", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Error issuing NOC certificate: " + e.getMessage()));
        }
    }

    /**
     * Get NOC certificate details
     * GET /api/insurance/noc/{fractionalizationRequestId}
     */
    @GetMapping("/noc/{fractionalizationRequestId}")
    public ResponseEntity<ApiResponse<NocCertificateDto>> getNocCertificate(
            @PathVariable UUID fractionalizationRequestId,
            Authentication authentication
    ) {
        log.info("API Request: Get NOC certificate for request: {}", fractionalizationRequestId);

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Unauthorized"));
        }

        try {
            NocCertificateDto noc = insuranceService.getNocCertificate(fractionalizationRequestId);
            return ResponseEntity.ok(ApiResponse.success(noc));
        } catch (Exception e) {
            log.error("Error retrieving NOC certificate", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("NOC certificate not found: " + e.getMessage()));
        }
    }

    /**
     * Get all NOC certificates for a patient
     * GET /api/insurance/patient/{patientId}/noc-certificates
     */
    @GetMapping("/patient/{patientId}/noc-certificates")
    public ResponseEntity<ApiResponse<List<NocCertificateDto>>> getPatientNocCertificates(
            @PathVariable UUID patientId,
            Authentication authentication
    ) {
        log.info("API Request: Get NOC certificates for patient: {}", patientId);

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Unauthorized"));
        }

        try {
            List<NocCertificateDto> nocs = insuranceService.getPatientNocCertificates(patientId);
            return ResponseEntity.ok(ApiResponse.success(nocs));
        } catch (Exception e) {
            log.error("Error retrieving patient NOC certificates", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error retrieving NOC certificates: " + e.getMessage()));
        }
    }

    /**
     * Revoke NOC certificate
     * POST /api/insurance/noc/{nocId}/revoke
     * Request body: {
     *   "reason": "Reason for revocation"
     * }
     */
    @PostMapping("/noc/{nocId}/revoke")
    public ResponseEntity<ApiResponse<NocCertificateDto>> revokeNocCertificate(
            @PathVariable UUID nocId,
            @RequestBody Map<String, String> request,
            Authentication authentication
    ) {
        log.info("API Request: Revoke NOC certificate: {}", nocId);

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Unauthorized"));
        }

        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Revocation reason is required"));
            }

            NocCertificateDto noc = insuranceService.revokeNocCertificate(nocId, reason);
            return ResponseEntity.ok(ApiResponse.success(noc));
        } catch (Exception e) {
            log.error("Error revoking NOC certificate", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error revoking NOC certificate: " + e.getMessage()));
        }
    }
}
