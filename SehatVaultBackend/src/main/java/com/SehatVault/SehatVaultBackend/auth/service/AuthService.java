package com.SehatVault.SehatVaultBackend.auth.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.SehatVault.SehatVaultBackend.auth.dto.AuthResponse;
import com.SehatVault.SehatVaultBackend.auth.dto.SigninRequest;
import com.SehatVault.SehatVaultBackend.auth.dto.SignupRequest;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.Settings;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.RoleRepository;
import com.SehatVault.SehatVaultBackend.auth.repository.SettingsRepository;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.auth.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;

/**
 * Auth Service
 * Contains business logic for user authentication and registration
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SettingsRepository settingsRepository;
    private final JwtUtil jwtUtil;
    private final JdbcTemplate jdbcTemplate;
    private final HospitalRepository hospitalRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Call stored procedure to log user activity
     * @param procedureName Name of the stored procedure (usp_log_login, usp_log_logout, usp_log_profile_update)
     * @param userId User ID
     * @param description Activity description
     */
    private void callActivityProcedure(String procedureName, java.util.UUID userId, String description) {
        try {
            String sql = String.format("CALL public.%s(?, ?)", procedureName);
            jdbcTemplate.update(sql, userId, description);
            System.out.println("Activity logged via procedure: " + procedureName);
        } catch (Exception e) {
            System.err.println("Failed to log activity via procedure: " + e.getMessage());
            // Don't throw exception, just log error to prevent interrupting auth flow
        }
    }

    /**
     * Call stored procedure to handle user signup and create role-specific records
     * @param userId User ID
     * @param role User role
     * @param hospitalId Hospital ID (optional, for hospital_staff and patients)
     */
    private void callSignupProcedure(java.util.UUID userId, String role, java.util.UUID hospitalId) {
        try {
            String sql = "CALL public.usp_handle_user_signup(?, ?, ?)";
            System.out.println("DEBUG: About to execute signup procedure with SQL: " + sql + " | User ID: " + userId + " | Role: " + role.toLowerCase() + " | Hospital ID: " + hospitalId);
            int result = jdbcTemplate.update(sql, userId, role.toLowerCase(), hospitalId);
            System.out.println("DEBUG: Signup procedure returned result: " + result);
            System.out.println("Signup procedure executed for user: " + userId + " with role: " + role + " and hospital: " + hospitalId);
        } catch (Exception e) {
            System.err.println("Failed to execute signup procedure!");
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("Error Message: " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception, just log error to prevent interrupting signup flow
            // The user is already created, so signup should succeed even if procedure fails
        }
    }

    private AuthResponse buildAuthResponse(User user, String role, String token) {
        AuthResponse response = new AuthResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                role,
                token
        );
        response.setPhoneNum(user.getPhoneNum());
        response.setAddress(user.getAddress());
        response.setCity(user.getCity());
        response.setBloodGroup(user.getBloodGroup());
        response.setDateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
        response.setHospitalId(user.getHospitalId());
        return response;
    }
    
    /**
     * User Sign Up
     * @param request SignupRequest containing user details
     * @return AuthResponse with user data and token if successful
     */
    public AuthResponse signup(SignupRequest request) {
        // Validate request
        if (!request.isValid()) {
            return new AuthResponse(false, "Invalid request data");
        }
        
        // Normalize email
        String email = request.getEmail().trim().toLowerCase();
        
        System.out.println("Attempting signup for email: " + email);
        System.out.println("Requested role: " + request.getRole());
        
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            System.out.println("Email already exists: " + email);
            return new AuthResponse(false, "Email already registered");
        }
        
        // Validate password strength
        if (request.getPassword().length() < 6) {
            return new AuthResponse(false, "Password must be at least 6 characters");
        }
        
        try {
            // Get role
            Role.RoleType roleType = Role.RoleType.valueOf(request.getRole().toLowerCase());
            System.out.println("Looking for role type: " + roleType);
            System.out.println("Total roles in database: " + roleRepository.count());
            
            Optional<Role> roleOpt = roleRepository.findByRoleName(roleType);
            
            if (roleOpt.isEmpty()) {
                System.out.println("Role not found: " + roleType);
                return new AuthResponse(false, "Invalid role provided");
            }
            
            Role role = roleOpt.get();
            System.out.println("Role found: " + role.getRoleName());
            
            // Create new user
            User newUser = new User();
            newUser.setName(request.getName());
            newUser.setEmail(email);
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setPhoneNum(request.getPhoneNum());
            newUser.setAddress(request.getAddress());
            newUser.setCity(request.getCity());
            newUser.setBloodGroup(request.getBloodGroup());
            
            // Look up hospital by name if provided (for patient, hospital_staff, hospital_admin roles)
            java.util.UUID hospitalId = null;
            if (request.getHospitalName() != null && !request.getHospitalName().isEmpty()) {
                Optional<com.SehatVault.SehatVaultBackend.hospital.entity.Hospital> hospitalOpt = 
                    hospitalRepository.findByHospitalName(request.getHospitalName());
                
                if (hospitalOpt.isPresent()) {
                    hospitalId = hospitalOpt.get().getHospitalId();
                    newUser.setHospitalId(hospitalId);
                    System.out.println("Hospital found: " + request.getHospitalName() + " with ID: " + hospitalId);
                } else {
                    System.out.println("WARNING: Hospital not found: " + request.getHospitalName());
                    // For patient role, hospital is required
                    if (roleType == Role.RoleType.patient) {
                        return new AuthResponse(false, "Hospital not found: " + request.getHospitalName());
                    }
                }
            }
            
            // Parse date of birth if provided
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    newUser.setDateOfBirth(LocalDate.parse(request.getDateOfBirth(), formatter));
                } catch (Exception e) {
                    return new AuthResponse(false, "Invalid date format. Use YYYY-MM-DD");
                }
            }
            
            newUser.setRole(role);
            newUser.setStatus(User.UserStatus.ACTIVE);
            newUser.setMfaEnabled(false);
            
            // Save user
            User savedUser = userRepository.save(newUser);
            System.out.println("User saved successfully with ID: " + savedUser.getUserId());
            System.out.println("User email in DB: " + savedUser.getEmail());
            
            // Create default settings for user
            Settings settings = new Settings();
            settings.setUser(savedUser);
            settings.setMultiFactorEnabled(false);
            settings.setEmailVerified(false);
            settings.setNotificationEnabled(true);
            settingsRepository.save(settings);
            
            // Call stored procedure to create role-specific records
            callSignupProcedure(savedUser.getUserId(), role.getRoleName().toString(), hospitalId);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(
                    savedUser.getUserId(),
                    savedUser.getEmail(),
                    savedUser.getRole().getRoleName().toString()
            );
            
            System.out.println("Token generated successfully");
            
            return buildAuthResponse(savedUser, role.getRoleName().toString(), token);
            
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid role error: " + e.getMessage());
            return new AuthResponse(false, "Invalid role: " + request.getRole());
        } catch (Exception e) {
            System.out.println("Error creating user: " + e.getMessage());
            e.printStackTrace();
            return new AuthResponse(false, "Error creating user: " + e.getMessage());
        }
    }
    
    /**
     * User Sign In
     * @param request SigninRequest containing email and password
     * @return AuthResponse with user data and token if successful
     */
    public AuthResponse signin(SigninRequest request) {
        // Validate request
        if (!request.isValid()) {
            return new AuthResponse(false, "Email and password are required");
        }
        
        // Normalize email
        String email = request.getEmail().trim().toLowerCase();
        
        System.out.println("Attempting signin for email: " + email);
        System.out.println("Total users in database: " + userRepository.count());
        
        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            System.out.println("User not found in database for email: " + email);
            return new AuthResponse(false, "User not found");
        }
        
        User user = userOpt.get();
        System.out.println("User found: " + user.getEmail() + ", Status: " + user.getStatus());
        
        // Check if user is active
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            return new AuthResponse(false, "User account is not active");
        }
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            System.out.println("Password mismatch for user: " + email);
            return new AuthResponse(false, "Invalid password");
        }
        
        System.out.println("Password verified, generating token");
        
        // Generate JWT token
        String token = jwtUtil.generateToken(
                user.getUserId(),
                user.getEmail(),
                user.getRole().getRoleName().toString()
        );
        
        // Log LOGIN activity via stored procedure
        callActivityProcedure("usp_log_login", user.getUserId(), "User successfully logged in");
        
        return buildAuthResponse(user, user.getRole().getRoleName().toString(), token);
    }
    
    /**
     * Get user by email
     * @param email User email
     * @return AuthResponse with user data
     */
    public AuthResponse getUserByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();
        return buildAuthResponse(user, user.getRole().getRoleName().toString(), "");
    }

    /**
     * Verify JWT token
     * @param token JWT token to verify
     * @return AuthResponse with user data if token is valid
     */
    public AuthResponse verifyToken(String token) {
        try {
            if (!jwtUtil.validateToken(token)) {
                return new AuthResponse(false, "Invalid token");
            }
            
            String email = jwtUtil.getEmailFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return new AuthResponse(false, "User not found");
            }
            
            User user = userOpt.get();
            return buildAuthResponse(user, role, token);
            
        } catch (Exception e) {
            return new AuthResponse(false, "Token verification failed: " + e.getMessage());
        }
    }
    
    /**
     * User Logout - Calls stored procedure to log logout activity
     * @param email User email
     */
    public void logoutUser(String email) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                callActivityProcedure("usp_log_logout", user.getUserId(), "User successfully logged out");
                System.out.println("User logged out: " + email);
            }
        } catch (Exception e) {
            System.err.println("Error logging out user: " + e.getMessage());
        }
    }
    
    /**
     * Update user profile - Calls stored procedure to update user table AND log activity
     * @param userId User ID
     * @param updates Map of fields to update
     * @return AuthResponse with updated user data
     */
    public AuthResponse updateProfile(java.util.UUID userId, java.util.Map<String, String> updates) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (userOpt.isEmpty()) {
                return new AuthResponse(false, "User not found");
            }
            
            // Extract update values (null if not provided)
            String name = updates.get("name");
            String phoneNum = updates.get("phoneNum");
            String address = updates.get("address");
            String city = updates.get("city");
            String bloodGroup = updates.get("bloodGroup");
            
            // Check if at least one field is being updated
            if (name == null && phoneNum == null && address == null && city == null && bloodGroup == null) {
                return new AuthResponse(false, "No fields to update");
            }
            
            // Call stored procedure to update user table AND log activity
            String sql = "CALL public.usp_log_profile_update(?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(sql, userId, name, phoneNum, address, city, bloodGroup);
            
            System.out.println("User profile updated via stored procedure: " + userId);
            
            // Fetch updated user from database
            User updatedUser = userRepository.findById(userId).orElseThrow();
            return buildAuthResponse(updatedUser, updatedUser.getRole().getRoleName().toString(), "");
            
        } catch (Exception e) {
            System.err.println("Error updating user profile: " + e.getMessage());
            e.printStackTrace();
            return new AuthResponse(false, "Update failed: " + e.getMessage());
        }
    }
}