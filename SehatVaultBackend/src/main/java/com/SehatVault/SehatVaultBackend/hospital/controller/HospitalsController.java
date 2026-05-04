package com.SehatVault.SehatVaultBackend.hospital.controller;

import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.hospital.dto.CreateHospitalRequest;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
public class HospitalsController {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    @GetMapping("/api/hospitals")
    public ResponseEntity<?> getAllHospitals() {
        try {
            List<Hospital> hospitals = hospitalRepository.findAll();
            return ResponseEntity.ok(success("Hospitals retrieved successfully", hospitals));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error fetching hospitals: " + e.getMessage()));
        }
    }

    @GetMapping("/api/hospitals/{hospitalId}")
    public ResponseEntity<?> getHospitalById(@PathVariable UUID hospitalId) {
        try {
            Hospital hospital = hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));
            return ResponseEntity.ok(success("Hospital retrieved successfully", hospital));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error fetching hospital: " + e.getMessage()));
        }
    }

    @PostMapping("/api/hospitals")
    public ResponseEntity<?> createHospital(Authentication authentication, @RequestBody CreateHospitalRequest request) {
        try {
            ensureSuperAdmin(authentication);
            validateRequest(request);

            if (hospitalRepository.findByHospitalName(request.getName()).isPresent()) {
                throw new IllegalArgumentException("Hospital name already exists");
            }
            if (hospitalRepository.findByCode(buildHospitalCode(request)).isPresent()) {
                throw new IllegalArgumentException("Hospital registration code already exists");
            }

            Hospital hospital = new Hospital();
            hospital.setHospitalId(UUID.randomUUID());
            hospital.setHospitalName(request.getName().trim());
            hospital.setRegistrationNum(request.getRegistrationNumber().trim());
            hospital.setAddress(request.getAddress().trim());
            hospital.setContactNum(request.getContactPhone().trim());
            hospital.setEmail(request.getContactEmail().trim().toLowerCase());
            hospital.setCity(request.getCity() != null ? request.getCity().trim() : null);
            hospital.setCode(buildHospitalCode(request));
            hospital.setVerificationStatus(Hospital.VerificationStatus.PENDING);
            hospital.setTotalAssets(0.0);
            hospital.setTotalAT(0.0);
            hospital.setTotalPatients(0);
            hospital.setCreatedAt(LocalDateTime.now());
            hospital.setUpdatedAt(LocalDateTime.now());

            Hospital saved = hospitalRepository.save(hospital);
            return ResponseEntity.ok(success("Hospital created successfully", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error creating hospital: " + e.getMessage()));
        }
    }

    @PatchMapping("/api/hospitals/{hospitalId}/status")
    public ResponseEntity<?> updateHospitalStatus(
            Authentication authentication,
            @PathVariable UUID hospitalId,
            @RequestBody Map<String, String> payload
    ) {
        try {
            ensureSuperAdmin(authentication);

            String status = payload != null ? payload.getOrDefault("status", "") : "";
            Hospital hospital = hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

            hospital.setVerificationStatus(mapStatus(status));
            Hospital saved = hospitalRepository.save(hospital);
            return ResponseEntity.ok(success("Hospital status updated successfully", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error updating hospital status: " + e.getMessage()));
        }
    }

    private void ensureSuperAdmin(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthorized");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() == null || user.getRole().getRoleName() != Role.RoleType.admin) {
            throw new IllegalArgumentException("Only super admins can manage hospitals");
        }
    }

    private void validateRequest(CreateHospitalRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (isBlank(request.getName()) || isBlank(request.getAddress()) || isBlank(request.getContactEmail())
                || isBlank(request.getContactPhone()) || isBlank(request.getRegistrationNumber())) {
            throw new IllegalArgumentException("All hospital fields are required");
        }
    }

    private String buildHospitalCode(CreateHospitalRequest request) {
        return "HOSP-" + request.getRegistrationNumber().trim().replaceAll("\\s+", "-").toUpperCase();
    }

    private Hospital.VerificationStatus mapStatus(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase();
        return switch (normalized) {
            case "active", "verified" -> Hospital.VerificationStatus.VERIFIED;
            case "suspended", "rejected", "inactive" -> Hospital.VerificationStatus.REJECTED;
            default -> Hospital.VerificationStatus.PENDING;
        };
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
