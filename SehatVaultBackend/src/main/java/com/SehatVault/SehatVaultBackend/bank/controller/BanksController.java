package com.SehatVault.SehatVaultBackend.bank.controller;

import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.bank.dto.CreateBankRequest;
import com.SehatVault.SehatVaultBackend.bank.entity.Bank;
import com.SehatVault.SehatVaultBackend.bank.repository.BankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/banks")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
public class BanksController {

    private final BankRepository bankRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllBanks() {
        try {
            List<Bank> banks = bankRepository.findAll();
            return ResponseEntity.ok(success("Banks retrieved successfully", banks));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error fetching banks: " + e.getMessage()));
        }
    }

    @GetMapping("/{bankId}")
    public ResponseEntity<?> getBankById(@PathVariable UUID bankId) {
        try {
            Bank bank = bankRepository.findById(bankId)
                    .orElseThrow(() -> new IllegalArgumentException("Bank not found"));
            return ResponseEntity.ok(success("Bank retrieved successfully", bank));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error fetching bank: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createBank(Authentication authentication, @RequestBody CreateBankRequest request) {
        try {
            ensureSuperAdmin(authentication);
            validateRequest(request);

            if (bankRepository.findByEmail(request.getEmail().trim()).isPresent()) {
                throw new IllegalArgumentException("Bank email already exists");
            }

            Bank bank = new Bank();
            bank.setBankId(UUID.randomUUID());
            bank.setBankName(request.getName().trim());
            bank.setRegistration(notBlank(request.getRegistration(), "BANK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()));
            bank.setSwiftCode(request.getSwiftCode() != null ? request.getSwiftCode().trim() : null);
            bank.setBankCode(notBlank(request.getBankCode(), "B-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase()));
            bank.setAddress(request.getAddress().trim());
            bank.setEmail(request.getEmail().trim().toLowerCase());
            bank.setContactNum(request.getPhone().trim());
            bank.setCity(request.getCity() != null ? request.getCity().trim() : null);
            bank.setVerificationStatus(Bank.VerificationStatus.PENDING);
            bank.setCreatedAt(LocalDateTime.now());
            bank.setUpdatedAt(LocalDateTime.now());

            Bank saved = bankRepository.save(bank);
            return ResponseEntity.ok(success("Bank created successfully", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error creating bank: " + e.getMessage()));
        }
    }

    @PatchMapping("/{bankId}/status")
    public ResponseEntity<?> updateBankStatus(
            Authentication authentication,
            @PathVariable UUID bankId,
            @RequestBody Map<String, String> payload
    ) {
        try {
            ensureSuperAdmin(authentication);

            String status = payload != null ? payload.getOrDefault("status", "") : "";
            Bank bank = bankRepository.findById(bankId)
                    .orElseThrow(() -> new IllegalArgumentException("Bank not found"));

            bank.setVerificationStatus(mapStatus(status));
            bank.setUpdatedAt(LocalDateTime.now());
            Bank saved = bankRepository.save(bank);
            return ResponseEntity.ok(success("Bank status updated successfully", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error updating bank status: " + e.getMessage()));
        }
    }

    private void ensureSuperAdmin(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthorized");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() == null || user.getRole().getRoleName() != Role.RoleType.admin) {
            throw new IllegalArgumentException("Only super admins can manage banks");
        }
    }

    private void validateRequest(CreateBankRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (isBlank(request.getName()) || isBlank(request.getAddress()) || isBlank(request.getEmail())
                || isBlank(request.getPhone())) {
            throw new IllegalArgumentException("Name, address, email, and phone are required");
        }
    }

    private Bank.VerificationStatus mapStatus(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase();
        return switch (normalized) {
            case "verified", "active" -> Bank.VerificationStatus.VERIFIED;
            case "rejected", "suspended", "inactive" -> Bank.VerificationStatus.REJECTED;
            default -> Bank.VerificationStatus.PENDING;
        };
    }

    private String notBlank(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
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
