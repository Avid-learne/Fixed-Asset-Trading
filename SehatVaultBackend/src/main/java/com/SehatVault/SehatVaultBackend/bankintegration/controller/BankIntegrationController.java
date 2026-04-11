package com.SehatVault.SehatVaultBackend.bankintegration.controller;

import com.SehatVault.SehatVaultBackend.bankintegration.dto.BankHospitalIntegrationDto;
import com.SehatVault.SehatVaultBackend.bankintegration.dto.BankOptionDto;
import com.SehatVault.SehatVaultBackend.bankintegration.dto.CreatePartnershipRequest;
import com.SehatVault.SehatVaultBackend.bankintegration.dto.HospitalBankIntegrationDto;
import com.SehatVault.SehatVaultBackend.bankintegration.dto.RejectPartnershipRequest;
import com.SehatVault.SehatVaultBackend.bankintegration.service.BankIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bank-integrations")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
public class BankIntegrationController {

    private final BankIntegrationService bankIntegrationService;

    @GetMapping("/hospital")
    public ResponseEntity<?> getHospitalIntegrations(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            List<HospitalBankIntegrationDto> data = bankIntegrationService.getHospitalIntegrations(authentication.getName());
            return ResponseEntity.ok(success("Hospital integrations loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading integrations: " + e.getMessage()));
        }
    }

    @GetMapping("/hospital/available-banks")
    public ResponseEntity<?> getAvailableBanks(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            List<BankOptionDto> data = bankIntegrationService.getAvailableBanksForHospital(authentication.getName());
            return ResponseEntity.ok(success("Available banks loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading available banks: " + e.getMessage()));
        }
    }

    @PostMapping("/hospital")
    public ResponseEntity<?> createHospitalIntegration(
            Authentication authentication,
            @RequestBody CreatePartnershipRequest request
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            HospitalBankIntegrationDto data = bankIntegrationService.createHospitalIntegration(authentication.getName(), request);
            return ResponseEntity.ok(success("Bank integration linked", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error creating integration: " + e.getMessage()));
        }
    }

    @DeleteMapping("/hospital/{partnershipId}")
    public ResponseEntity<?> removeHospitalIntegration(Authentication authentication, @PathVariable UUID partnershipId) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            bankIntegrationService.removeHospitalIntegration(authentication.getName(), partnershipId);
            return ResponseEntity.ok(success("Bank integration removed", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error removing integration: " + e.getMessage()));
        }
    }

    @GetMapping("/bank")
    public ResponseEntity<?> getBankIntegrations(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            List<BankHospitalIntegrationDto> data = bankIntegrationService.getBankIntegrations(authentication.getName());
            return ResponseEntity.ok(success("Bank integrations loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading bank integrations: " + e.getMessage()));
        }
    }

    @PostMapping("/bank/{partnershipId}/approve")
    public ResponseEntity<?> approveIntegration(Authentication authentication, @PathVariable UUID partnershipId) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            BankHospitalIntegrationDto data = bankIntegrationService.approveIntegration(authentication.getName(), partnershipId);
            return ResponseEntity.ok(success("Integration approved", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error approving integration: " + e.getMessage()));
        }
    }

    @PostMapping("/bank/{partnershipId}/reject")
    public ResponseEntity<?> rejectIntegration(
            Authentication authentication,
            @PathVariable UUID partnershipId,
            @RequestBody(required = false) RejectPartnershipRequest request
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            String reason = request != null ? request.getReason() : null;
            BankHospitalIntegrationDto data = bankIntegrationService.rejectIntegration(authentication.getName(), partnershipId, reason);
            return ResponseEntity.ok(success("Integration rejected", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error rejecting integration: " + e.getMessage()));
        }
    }

    @DeleteMapping("/bank/{partnershipId}")
    public ResponseEntity<?> removeBankIntegration(Authentication authentication, @PathVariable UUID partnershipId) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            bankIntegrationService.removeBankIntegration(authentication.getName(), partnershipId);
            return ResponseEntity.ok(success("Hospital integration removed", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error removing integration: " + e.getMessage()));
        }
    }

    @GetMapping("/bank/hospital/{hospitalId}/staff")
    public ResponseEntity<?> getHospitalStaff(Authentication authentication, @PathVariable UUID hospitalId) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            var data = bankIntegrationService.getHospitalStaffForBank(authentication.getName(), hospitalId);
            return ResponseEntity.ok(success("Hospital staff loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading hospital staff: " + e.getMessage()));
        }
    }

    private Map<String, Object> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
