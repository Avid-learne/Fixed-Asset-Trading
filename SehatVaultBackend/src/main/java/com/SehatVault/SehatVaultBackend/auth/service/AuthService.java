package com.SehatVault.SehatVaultBackend.auth.service;

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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

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
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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
}

