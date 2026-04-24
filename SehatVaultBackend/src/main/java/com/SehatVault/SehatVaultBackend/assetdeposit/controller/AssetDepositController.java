package com.SehatVault.SehatVaultBackend.assetdeposit.controller;

import com.SehatVault.SehatVaultBackend.assetdeposit.dto.AssetDepositDto;
import com.SehatVault.SehatVaultBackend.assetdeposit.dto.HospitalOptionDto;
import com.SehatVault.SehatVaultBackend.assetdeposit.dto.RejectAssetDepositRequest;
import com.SehatVault.SehatVaultBackend.assetdeposit.dto.SubmitAssetDepositRequest;
import com.SehatVault.SehatVaultBackend.assetdeposit.service.AssetDepositService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.SehatVault.SehatVaultBackend.bank.entity.Bank;
import com.SehatVault.SehatVaultBackend.bank.repository.BankRepository;
import com.SehatVault.SehatVaultBackend.bankintegration.entity.Partnership;
import com.SehatVault.SehatVaultBackend.bankintegration.repository.PartnershipRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/asset-deposits")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
public class AssetDepositController {

    private final AssetDepositService assetDepositService;
    private final PartnershipRepository partnershipRepository;
    private final BankRepository bankRepository;
    private final UserRepository userRepository;

    @GetMapping("/hospitals")
    public ResponseEntity<?> getHospitals() {
        try {
            List<HospitalOptionDto> data = assetDepositService.getHospitalOptions();
            return ResponseEntity.ok(success("Hospitals loaded", data));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading hospitals: " + e.getMessage()));
        }
    }

    @PostMapping("/requests")
    public ResponseEntity<?> submitRequest(Authentication authentication, @RequestBody SubmitAssetDepositRequest request) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            AssetDepositDto data = assetDepositService.submitRequest(authentication.getName(), request);
            return ResponseEntity.ok(success("Deposit request submitted", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error submitting request: " + e.getMessage()));
        }
    }

    @GetMapping("/hospital/requests")
    public ResponseEntity<?> getHospitalRequests(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "all") String status
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            List<AssetDepositDto> data = assetDepositService.getHospitalRequests(authentication.getName(), status);
            return ResponseEntity.ok(success("Hospital deposit requests loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading requests: " + e.getMessage()));
        }
    }

    @GetMapping("/bank/requests")
    public ResponseEntity<?> getBankRequests(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "pending") String bankStatus
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            List<AssetDepositDto> data = assetDepositService.getBankRequests(authentication.getName(), bankStatus);
            return ResponseEntity.ok(success("Bank deposit requests loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading bank requests: " + e.getMessage()));
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyRequests(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "all") String status
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            List<AssetDepositDto> data = assetDepositService.getMyRequests(authentication.getName(), status);
            return ResponseEntity.ok(success("Patient deposit requests loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading patient requests: " + e.getMessage()));
        }
    }

    @GetMapping("/integrated-banks")
    public ResponseEntity<?> getIntegratedBanks(Authentication authentication) {
        try {
            if (authentication == null) return ResponseEntity.status(401).body(error("Unauthorized"));
            User user = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (user == null || user.getHospitalId() == null) return ResponseEntity.badRequest().body(error("Hospital not found"));

            List<Map<String, Object>> banks = partnershipRepository
                    .findByHospitalIdOrderByCreatedAtDesc(user.getHospitalId())
                    .stream()
                    .filter(p -> p.getIntegrationStatus() == Partnership.IntegrationStatus.APPROVED)
                    .map(p -> {
                        Bank bank = bankRepository.findById(p.getBankId()).orElse(null);
                        Map<String, Object> m = new HashMap<>();
                        m.put("bankId", p.getBankId());
                        m.put("bankName", bank != null ? bank.getBankName() : "Unknown Bank");
                        return m;
                    })
                    .toList();
            return ResponseEntity.ok(success("Integrated banks", banks));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{assetId}/approve")
    public ResponseEntity<?> approveRequest(
            Authentication authentication,
            @PathVariable UUID assetId,
            @RequestParam(required = false) UUID bankId) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            AssetDepositDto data = assetDepositService.approveRequest(authentication.getName(), assetId, bankId);
            return ResponseEntity.ok(success("Deposit approved", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error approving request: " + e.getMessage()));
        }
    }

    @PostMapping("/{assetId}/reject")
    public ResponseEntity<?> rejectRequest(
            Authentication authentication,
            @PathVariable UUID assetId,
            @RequestBody RejectAssetDepositRequest request
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            AssetDepositDto data = assetDepositService.rejectRequest(
                    authentication.getName(),
                    assetId,
                    request != null ? request.getReason() : null
            );
            return ResponseEntity.ok(success("Deposit rejected", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error rejecting request: " + e.getMessage()));
        }
    }

    @PostMapping("/{assetId}/bank-approve")
    public ResponseEntity<?> approveRequestByBank(Authentication authentication, @PathVariable UUID assetId) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            AssetDepositDto data = assetDepositService.approveRequestByBank(authentication.getName(), assetId);
            return ResponseEntity.ok(success("Deposit approved by bank", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error approving request by bank: " + e.getMessage()));
        }
    }

    @PostMapping("/{assetId}/bank-reject")
    public ResponseEntity<?> rejectRequestByBank(
            Authentication authentication,
            @PathVariable UUID assetId,
            @RequestBody RejectAssetDepositRequest request
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            AssetDepositDto data = assetDepositService.rejectRequestByBank(
                    authentication.getName(),
                    assetId,
                    request != null ? request.getReason() : null
            );
            return ResponseEntity.ok(success("Deposit rejected by bank", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error rejecting request by bank: " + e.getMessage()));
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
