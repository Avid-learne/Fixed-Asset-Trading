package com.SehatVault.SehatVaultBackend.hospital.controller;

import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.hospital.dto.ProfitSettingsDto;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hospital")
@CrossOrigin(originPatterns = "http://localhost:*")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    /**
     * Get current hospital's profit allocation settings
     * GET /api/hospital/profit-settings
     */
    @GetMapping("/profit-settings")
    public ResponseEntity<?> getProfitSettings(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }

            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            if (user.getRole() == null || user.getRole().getRoleName() != Role.RoleType.hospital_admin) {
                return ResponseEntity.status(403).body(error("Only hospital admins can access profit settings"));
            }

            UUID hospitalId = user.getHospitalId();
            if (hospitalId == null) {
                return ResponseEntity.badRequest().body(error("Hospital not linked to this account"));
            }

            Hospital hospital = hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

            ProfitSettingsDto dto = ProfitSettingsDto.builder()
                    .patientProfitPercent(hospital.getPatientProfitPercent() != null ? hospital.getPatientProfitPercent() : 40.0)
                    .hospitalProfitPercent(hospital.getHospitalProfitPercent() != null ? hospital.getHospitalProfitPercent() : 50.0)
                    .bankProfitPercent(hospital.getBankProfitPercent() != null ? hospital.getBankProfitPercent() : 10.0)
                    .build();

            return ResponseEntity.ok(success("Profit settings retrieved successfully", dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error retrieving profit settings: " + e.getMessage()));
        }
    }

    /**
     * Update hospital's profit allocation settings
     * PUT /api/hospital/profit-settings
     */
    @PutMapping("/profit-settings")
    public ResponseEntity<?> updateProfitSettings(
            Authentication authentication,
            @RequestBody ProfitSettingsDto request) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }

            if (request == null) {
                return ResponseEntity.badRequest().body(error("Request body is required"));
            }

            // Validate percentages
            if (!request.isValid()) {
                return ResponseEntity.badRequest().body(error(request.getValidationError()));
            }

            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            if (user.getRole() == null || user.getRole().getRoleName() != Role.RoleType.hospital_admin) {
                return ResponseEntity.status(403).body(error("Only hospital admins can update profit settings"));
            }

            UUID hospitalId = user.getHospitalId();
            if (hospitalId == null) {
                return ResponseEntity.badRequest().body(error("Hospital not linked to this account"));
            }

            Hospital hospital = hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

            // Update profit settings
            hospital.setPatientProfitPercent(request.getPatientProfitPercent());
            hospital.setHospitalProfitPercent(request.getHospitalProfitPercent());
            hospital.setBankProfitPercent(request.getBankProfitPercent());

            Hospital updated = hospitalRepository.save(hospital);

            ProfitSettingsDto responseDto = ProfitSettingsDto.builder()
                    .patientProfitPercent(updated.getPatientProfitPercent())
                    .hospitalProfitPercent(updated.getHospitalProfitPercent())
                    .bankProfitPercent(updated.getBankProfitPercent())
                    .build();

            return ResponseEntity.ok(success("Profit settings updated successfully", responseDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error updating profit settings: " + e.getMessage()));
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
