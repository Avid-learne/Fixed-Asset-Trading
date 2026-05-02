package com.SehatVault.SehatVaultBackend.fractionalization.controller;

import com.SehatVault.SehatVaultBackend.fractionalization.dto.AdminDecisionRequest;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.CreateFractionalizationRequest;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.FractionalAllocationView;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.FractionalizationRequestView;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.RedeemFractionalHtRequest;
import com.SehatVault.SehatVaultBackend.fractionalization.dto.RevokeAllocationRequest;
import com.SehatVault.SehatVaultBackend.fractionalization.service.FractionalizationService;
import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fractionalization")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
@Slf4j
public class FractionalizationController {

    private final FractionalizationService fractionalizationService;

    /**
     * Without these handlers, a service-thrown IllegalArgumentException would bubble up
     * to Spring's default 500 page (HTML or empty body), causing the frontend's
     * `await res.json()` to die with "Unexpected end of JSON input" — hiding the real
     * error from the user. Always return JSON ApiResponse so the UI can show the message.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception ex) {
        log.error("Unexpected error in FractionalizationController", ex);
        return ResponseEntity.status(500)
                .body(ApiResponse.error("Server error: " + ex.getMessage()));
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<FractionalizationRequestView>> submitRequest(
            Authentication authentication,
            @RequestBody CreateFractionalizationRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.submitRequest(authentication.getName(), request)
        ));
    }

    @GetMapping("/requests/mine")
    public ResponseEntity<ApiResponse<List<FractionalizationRequestView>>> myRequests(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.listMyRequests(authentication.getName())
        ));
    }

    @GetMapping("/admin/requests/pending")
    public ResponseEntity<ApiResponse<List<FractionalizationRequestView>>> pendingForAdmin(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.listPendingForAdmin(authentication.getName())
        ));
    }

    @PostMapping("/admin/requests/{requestId}/forward")
    public ResponseEntity<ApiResponse<FractionalizationRequestView>> forwardToInsurer(
            Authentication authentication,
            @PathVariable UUID requestId
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.forwardToInsurer(authentication.getName(), requestId)
        ));
    }

    @GetMapping("/insurer/requests/pending")
    public ResponseEntity<ApiResponse<List<FractionalizationRequestView>>> pendingForInsurer(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.listPendingForInsurer(authentication.getName())
        ));
    }

        @PostMapping("/insurer/requests/{requestId}/approve")
        public ResponseEntity<ApiResponse<FractionalizationRequestView>> approve(
            Authentication authentication,
            @PathVariable UUID requestId,
            @RequestBody AdminDecisionRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.approveWithNoc(authentication.getName(), requestId, request)
        ));
    }

    @PostMapping("/admin/requests/{requestId}/reject")
    public ResponseEntity<ApiResponse<FractionalizationRequestView>> reject(
            Authentication authentication,
            @PathVariable UUID requestId,
            @RequestBody AdminDecisionRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.reject(authentication.getName(), requestId, request)
        ));
    }

    @GetMapping("/allocations/beneficiary")
    public ResponseEntity<ApiResponse<List<FractionalAllocationView>>> myBeneficiaryAllocations(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.listMyBeneficiaryAllocations(authentication.getName())
        ));
    }

    @PostMapping("/allocations/redeem")
    public ResponseEntity<ApiResponse<FractionalAllocationView>> redeemFromOwnProfile(
            Authentication authentication,
            @RequestBody RedeemFractionalHtRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.redeemFromOwnProfile(authentication.getName(), request)
        ));
    }

    @GetMapping("/allocations/primary")
    public ResponseEntity<ApiResponse<List<FractionalAllocationView>>> myPrimaryAllocations(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.listMyPrimaryAllocations(authentication.getName())
        ));
    }

    @PostMapping("/hospital/redeem")
    public ResponseEntity<ApiResponse<FractionalAllocationView>> redeemAtHospital(
            Authentication authentication,
            @RequestBody RedeemFractionalHtRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.redeemForBeneficiaryAtHospital(authentication.getName(), request)
        ));
    }

    @PostMapping("/allocations/{allocationId}/revoke")
    public ResponseEntity<ApiResponse<FractionalAllocationView>> revoke(
            Authentication authentication,
            @PathVariable UUID allocationId,
            @RequestBody(required = false) RevokeAllocationRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                fractionalizationService.revokeAllocation(authentication.getName(), allocationId, request)
        ));
    }
}
