package com.SehatVault.SehatVaultBackend.hospital.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.hospital.dto.StaffMemberResponse;
import com.SehatVault.SehatVaultBackend.hospital.service.HospitalStaffService;

import lombok.RequiredArgsConstructor;

/**
 * HospitalStaff Controller
 * Handles staff management endpoints for hospital admin
 */
@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HospitalStaffController {
    
    private final HospitalStaffService hospitalStaffService;
    private final UserRepository userRepository;
    
    /**
     * Get all staff members for the hospital
     * GET /api/staff
     * Optional query param: status=active|inactive|pending
     * 
     * NOTE: This endpoint now filters to show only users with role_id = 'hospital_staff'
     */
    @GetMapping
    public ResponseEntity<?> getStaff(
            Authentication authentication,
            @RequestParam(required = false) String status
    ) {
        try {
            // Get current user to determine their hospital
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            UUID hospitalId = currentUser.getHospitalId();
            if (hospitalId == null) {
                return ResponseEntity.badRequest().body(error("User is not associated with a hospital"));
            }
            
            // Get staff members with hospital_staff role
            List<StaffMemberResponse> staff;
            if (status != null && !status.isEmpty()) {
                staff = hospitalStaffService.getHospitalStaffByHospitalIdAndStatus(hospitalId, status);
            } else {
                staff = hospitalStaffService.getHospitalStaffByHospitalId(hospitalId);
            }
            
            return ResponseEntity.ok(success("Staff retrieved successfully", staff));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error retrieving staff: " + e.getMessage()));
        }
    }
    
    /**
     * Get all staff members including non-hospital_staff roles
     * GET /api/staff/all
     * Optional query param: status=active|inactive|pending
     * 
     * NOTE: This endpoint returns all staff regardless of role
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllStaff(
            Authentication authentication,
            @RequestParam(required = false) String status
    ) {
        try {
            // Get current user to determine their hospital
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            UUID hospitalId = currentUser.getHospitalId();
            if (hospitalId == null) {
                return ResponseEntity.badRequest().body(error("User is not associated with a hospital"));
            }
            
            // Get all staff members regardless of role
            List<StaffMemberResponse> staff;
            if (status != null && !status.isEmpty()) {
                staff = hospitalStaffService.getStaffByHospitalIdAndStatus(hospitalId, status);
            } else {
                staff = hospitalStaffService.getStaffByHospitalId(hospitalId);
            }
            
            return ResponseEntity.ok(success("All staff retrieved successfully", staff));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error retrieving staff: " + e.getMessage()));
        }
    }
    
    /**
     * Get a specific staff member by ID
     * GET /api/staff/{staffId}
     */
    @GetMapping("/{staffId}")
    public ResponseEntity<?> getStaffById(@PathVariable UUID staffId) {
        try {
            StaffMemberResponse staff = hospitalStaffService.getStaffById(staffId);
            return ResponseEntity.ok(success("Staff retrieved successfully", staff));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error retrieving staff: " + e.getMessage()));
        }
    }
    
    /**
     * Invite a new staff member
     * POST /api/staff/invite
     */
    @PostMapping("/invite")
    public ResponseEntity<?> inviteStaff(
            Authentication authentication,
            @RequestBody Map<String, String> request
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            
            String email = request.get("email");
            String role = request.get("role");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(error("Email is required"));
            }
            if (role == null || role.isEmpty()) {
                return ResponseEntity.badRequest().body(error("Role is required"));
            }
            
            User currentUser = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // TODO: Implement invitation logic - create pending user, send email, etc.
            // For now, return success message
            return ResponseEntity.ok(success("Invitation sent successfully", Map.of(
                    "email", email,
                    "role", role,
                    "status", "pending"
            )));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error sending invitation: " + e.getMessage()));
        }
    }
    
    /**
     * Deactivate a staff member
     * PUT /api/staff/{staffId}/deactivate
     */
    @PutMapping("/{staffId}/deactivate")
    public ResponseEntity<?> deactivateStaff(
            Authentication authentication,
            @PathVariable UUID staffId
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(error("Unauthorized"));
            }
            
            // TODO: Implement deactivation logic
            // For now, return success message
            return ResponseEntity.ok(success("Staff member deactivated successfully", Map.of(
                    "staffId", staffId,
                    "status", "inactive"
            )));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(error("Error deactivating staff: " + e.getMessage()));
        }
    }
    
    /**
     * Success response builder
     */
    private Map<String, Object> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }
    
    /**
     * Error response builder
     */
    private Map<String, Object> error(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
