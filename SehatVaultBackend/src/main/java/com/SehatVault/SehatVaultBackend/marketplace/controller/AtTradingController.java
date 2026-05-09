package com.SehatVault.SehatVaultBackend.marketplace.controller;

import com.SehatVault.SehatVaultBackend.marketplace.dto.*;
import com.SehatVault.SehatVaultBackend.marketplace.entity.*;
import com.SehatVault.SehatVaultBackend.marketplace.service.AtTradingService;
import com.SehatVault.SehatVaultBackend.wallet.service.TokenPriceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * API Controller for AT Trading lifecycle management
 */
@Slf4j
@RestController
@RequestMapping("/api/marketplace/at-trading")
public class AtTradingController {

    @Autowired
    private AtTradingService atTradingService;

    @Autowired
    private TokenPriceService tokenPriceService;

    @Autowired
    private com.SehatVault.SehatVaultBackend.auth.repository.UserRepository userRepository;

    @Autowired
    private com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository patientRepository;

    /**
     * Hospital staff/admin view: patient-share monthly HT distributions for the current hospital.
     */
    @GetMapping("/hospital/patient-share-distributions")
    public ResponseEntity<ApiResponse<List<HospitalPatientShareDistributionDto>>> getHospitalPatientShareDistributions(
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            List<HospitalPatientShareDistributionDto> rows = atTradingService
                    .getHospitalPatientShareDistributions(authentication.getName());
            return ResponseEntity.ok(ApiResponse.success("Patient-share distributions loaded", rows));
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage() == null ? "Bad request" : e.getMessage();
            if ("Forbidden".equalsIgnoreCase(msg)) {
                return ResponseEntity.status(403).body(ApiResponse.error(msg));
            }
            if ("Unauthorized".equalsIgnoreCase(msg)) {
                return ResponseEntity.status(401).body(ApiResponse.error(msg));
            }
            return ResponseEntity.badRequest().body(ApiResponse.error(msg));
        } catch (Exception e) {
            log.error("Error fetching hospital patient-share distributions", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to load distributions"));
        }
    }

    /**
     * Get patient's AT status summary
     */
    @GetMapping("/patient/{patientId}/status")
    public ResponseEntity<AtStatusSummaryDto> getPatientAtStatus(@PathVariable UUID patientId) {
        log.info("Fetching AT status for patient {}", patientId);

        try {
            AtTradingService.AtStatusSummary summary = atTradingService.getPatientAtStatusSummary(patientId);
            AtStatusSummaryDto dto = AtStatusSummaryDto.builder()
                    .patientId(summary.getPatientId())
                    .totalAvailableAt(summary.getTotalAvailableAt())
                    .totalUnavailableAt(summary.getTotalUnavailableAt())
                    .totalAt(summary.getTotalAt())
                    .pendingMonthlyHtAmount(summary.getPendingMonthlyHtAmount())
                    .activeTradeCount(summary.getActiveTradeCount())
                    .activeWithdrawalRequests(summary.getActiveWithdrawalRequests().stream()
                            .map(this::toWithdrawalRequestDto)
                            .collect(Collectors.toList()))
                    .build();

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error fetching AT status for patient {}", patientId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get patient's available AT
     */
    @GetMapping("/patient/{patientId}/available")
    public ResponseEntity<List<PatientAtAssignmentDto>> getAvailableAt(@PathVariable UUID patientId) {
        log.info("Fetching available AT for patient {}", patientId);

        try {
            List<PatientAtAssignmentDto> dtos = atTradingService.getAvailableAtForPatient(patientId)
                    .stream()
                    .map(this::toAssignmentDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching available AT for patient {}", patientId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get the currently-authenticated patient's asset tokens (no patientId in URL).
     * Resolves the patient row from the JWT email so the dashboard works even if the
     * frontend's localStorage doesn't have patientId cached.
     */
    @GetMapping("/me/asset-tokens")
    public ResponseEntity<ApiResponse<List<PatientAssetTokenDto>>> getMyAssetTokens(
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            var user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            var patient = patientRepository.findByUserId(user.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));
            List<PatientAssetTokenDto> tokens = atTradingService.getPatientAssetTokens(patient.getId());
            return ResponseEntity.ok(ApiResponse.success("Asset tokens retrieved successfully", tokens));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching asset tokens for current user", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch asset tokens: " + e.getMessage()));
        }
    }

    /**
     * Get patient's linked asset tokens with availability status
     */
    @GetMapping("/patient/{patientId}/asset-tokens")
    public ResponseEntity<ApiResponse<List<PatientAssetTokenDto>>> getPatientAssetTokens(@PathVariable UUID patientId) {
        log.info("Fetching asset tokens for patient {}", patientId);

        try {
            List<PatientAssetTokenDto> tokens = atTradingService.getPatientAssetTokens(patientId);
            return ResponseEntity.ok(ApiResponse.success("Asset tokens retrieved successfully", tokens));
        } catch (Exception e) {
            log.error("Error fetching asset tokens for patient {}", patientId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch asset tokens: " + e.getMessage()));
        }
    }

    /**
     * Start a trade with patient's AT
     */
    @PostMapping("/trades/start-with-at")
    public ResponseEntity<?> startTradeWithAt(@RequestBody StartTradeWithAtRequest request) {
        log.info("Starting trade {} with patient {} AT", request.getTradeId(), request.getPatientId());

        try {
            TradeParticipation participation = atTradingService.startTradeWithPatientAt(
                    request.getTradeId(),
                    request.getPatientId(),
                    request.getAssetId(),
                    request.getAssignmentId(),
                    request.getAtAmount());

            return ResponseEntity.ok(toParticipationDto(participation));
        } catch (Exception e) {
            log.error("Error starting trade with AT", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get patient's active trades
     */
    @GetMapping("/patient/{patientId}/active-trades")
    public ResponseEntity<List<TradeParticipationDto>> getActiveAtTrades(@PathVariable UUID patientId) {
        log.info("Fetching active AT trades for patient {}", patientId);

        try {
            List<TradeParticipationDto> dtos = atTradingService.getActiveAtTradesForPatient(patientId)
                    .stream()
                    .map(this::toParticipationDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching active trades for patient {}", patientId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Request AT withdrawal
     */
    @PostMapping("/withdrawals/request")
    public ResponseEntity<?> requestAtWithdrawal(@RequestBody PatientAtWithdrawalRequestDto request) {
        log.info("Patient {} requesting AT withdrawal for trade {}", request.getPatientId(), request.getTradeId());

        try {
            PatientAtWithdrawalRequest withdrawalRequest = atTradingService.requestAtWithdrawal(
                    request.getPatientId(),
                    request.getAssetId(),
                    request.getTradeId(),
                    request.getAssignmentId(),
                    request.getReason());

            return ResponseEntity.ok(toWithdrawalRequestDto(withdrawalRequest));
        } catch (Exception e) {
            log.error("Error requesting AT withdrawal", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get withdrawal request status
     */
    @GetMapping("/withdrawals/{requestId}/status")
    public ResponseEntity<PatientAtWithdrawalRequestDto> getWithdrawalStatus(@PathVariable UUID requestId) {
        log.info("Fetching withdrawal request status for {}", requestId);

        try {
            PatientAtWithdrawalRequest request = atTradingService.getWithdrawalRequestStatus(requestId);
            return ResponseEntity.ok(toWithdrawalRequestDto(request));
        } catch (Exception e) {
            log.error("Error fetching withdrawal status", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get patient's pending monthly HT distributions
     */
    @GetMapping("/patient/{patientId}/pending-ht-distributions")
    public ResponseEntity<List<MonthlyHtDistributionDto>> getPendingHtDistributions(@PathVariable UUID patientId) {
        log.info("Fetching pending HT distributions for patient {}", patientId);

        try {
            List<MonthlyHtDistributionDto> dtos = atTradingService.getPendingMonthlyHtDistributions(patientId)
                    .stream()
                    .map(this::toMonthlyHtDistributionDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching pending HT distributions", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Helper mapping methods

    private PatientAtAssignmentDto toAssignmentDto(PatientAtAssignment entity) {
        return PatientAtAssignmentDto.builder()
                .assignmentId(entity.getAssignmentId())
                .patientId(entity.getPatientId())
                .assetId(entity.getAssetId())
                .hospitalId(entity.getHospitalId())
                .totalAtAssigned(entity.getTotalAtAssigned())
                .availableAt(entity.getAvailableAt())
                .unavailableAt(entity.getTotalAtAssigned().subtract(entity.getAvailableAt()))
                .availabilityStatus(entity.getAvailabilityStatus().toString())
                .monetaryValue(entity.getMonetaryValue(tokenPriceService.getAtPricePkr()))
                .availableMonetaryValue(entity.getAvailableMonetaryValue(tokenPriceService.getAtPricePkr()))
                .unavailableMonetaryValue(entity.getUnavailableMonetaryValue(tokenPriceService.getAtPricePkr()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private TradeParticipationDto toParticipationDto(TradeParticipation entity) {
        return TradeParticipationDto.builder()
                .participationId(entity.getParticipationId())
                .tradeId(entity.getTradeId())
                .patientId(entity.getPatientId())
                .assetId(entity.getAssetId())
                .assignmentId(entity.getAssignmentId())
                .atAllocated(entity.getAtAllocated())
                .atMonetaryValuePkr(entity.getAtMonetaryValuePkr())
                .participationStatus(entity.getParticipationStatus().toString())
                .monthlyHtAmount(entity.calculateMonthlyHtDistribution())
                .tradeStartTime(entity.getTradeStartTime())
                .tradeEndTime(entity.getTradeEndTime())
                .markedUnavailableAt(entity.getMarkedUnavailableAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private MonthlyHtDistributionDto toMonthlyHtDistributionDto(MonthlyHtDistribution entity) {
        return MonthlyHtDistributionDto.builder()
                .distributionId(entity.getDistributionId())
                .tradeId(entity.getTradeId())
                .participationId(entity.getParticipationId())
                .patientId(entity.getPatientId())
                .distributionMonth(entity.getDistributionMonth())
                .atPercentageRate(entity.getAtPercentageRate())
                .atAmountBase(entity.getAtAmountBase())
                .calculatedHtAmount(entity.getCalculatedHtAmount())
                .isDistributed(entity.getIsDistributed())
                .distributedAt(entity.getDistributedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private PatientAtWithdrawalRequestDto toWithdrawalRequestDto(PatientAtWithdrawalRequest entity) {
        return PatientAtWithdrawalRequestDto.builder()
                .requestId(entity.getRequestId())
                .patientId(entity.getPatientId())
                .assetId(entity.getAssetId())
                .tradeId(entity.getTradeId())
                .assignmentId(entity.getAssignmentId())
                .requestedAt(entity.getRequestedAt())
                .reason(entity.getReason())
                .requestStatus(entity.getRequestStatus().toString())
                .tradeRemainingTimeDays(entity.getTradeRemainingTimeDays())
                .notifiedAt(entity.getNotifiedAt())
                .approvedAt(entity.getApprovedAt())
                .retrievedAt(entity.getRetrievedAt())
                .hospitalNotes(entity.getHospitalNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
