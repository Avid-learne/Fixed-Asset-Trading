package com.SehatVault.SehatVaultBackend.auth.controller;

import com.SehatVault.SehatVaultBackend.auth.dto.AuthResponse;
import com.SehatVault.SehatVaultBackend.auth.dto.SigninRequest;
import com.SehatVault.SehatVaultBackend.auth.dto.SignupRequest;
import com.SehatVault.SehatVaultBackend.auth.service.AuthService;
import com.SehatVault.SehatVaultBackend.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Auth Controller
 * Handles authentication endpoints (signup, signin, verify)
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    
    /**
     * User Sign Up endpoint
     * POST /api/auth/signup
     * @param request SignupRequest
     * @return AuthResponse with user data and token
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * User Sign In endpoint
     * POST /api/auth/signin
     * @param request SigninRequest
     * @return AuthResponse with user data and token
     */
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody SigninRequest request) {
        AuthResponse response = authService.signin(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    /**
     * Verify Token endpoint
     * POST /api/auth/verify
     * @param authHeader Authorization header with Bearer token
     * @return AuthResponse with user data if token is valid
     */
    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verifyToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Missing or invalid authorization header"));
        }
        
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        AuthResponse response = authService.verifyToken(token);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Get Current User Profile (Protected Endpoint)
     * GET /api/auth/me
     * Requires: Authorization header with Bearer token
     * @param authHeader Authorization header
     * @return User profile data
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Missing or invalid authorization header"));
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(false, "Invalid or expired token"));
            }

            String email = jwtUtil.getEmailFromToken(token);
            AuthResponse response = authService.getUserByEmail(email);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Token validation error: " + e.getMessage()));
        }
    }
}
