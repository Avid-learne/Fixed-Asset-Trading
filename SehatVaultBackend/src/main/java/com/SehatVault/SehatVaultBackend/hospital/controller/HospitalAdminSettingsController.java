package com.SehatVault.SehatVaultBackend.hospital.controller;

import com.SehatVault.SehatVaultBackend.hospital.dto.HospitalAdminSettingsResponse;
import com.SehatVault.SehatVaultBackend.hospital.dto.UpdateHospitalAdminSettingsRequest;
import com.SehatVault.SehatVaultBackend.hospital.service.HospitalAdminSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hospital-admin/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HospitalAdminSettingsController {

    private final HospitalAdminSettingsService hospitalAdminSettingsService;

    @GetMapping
    public ResponseEntity<?> getSettings(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }

            HospitalAdminSettingsResponse data = hospitalAdminSettingsService.getSettingsByEmail(authentication.getName());
            return ResponseEntity.ok(success("Settings loaded", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error loading settings: " + e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(
            Authentication authentication,
            @RequestBody UpdateHospitalAdminSettingsRequest request
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }

            HospitalAdminSettingsResponse data = hospitalAdminSettingsService
                    .updateSettingsByEmail(authentication.getName(), request);
            return ResponseEntity.ok(success("Settings updated", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error updating settings: " + e.getMessage()));
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
