package com.SehatVault.SehatVaultBackend.auth.controller;

import com.SehatVault.SehatVaultBackend.auth.dto.AuthResponse;
import com.SehatVault.SehatVaultBackend.auth.dto.SigninRequest;
import com.SehatVault.SehatVaultBackend.auth.dto.SignupRequest;
import com.SehatVault.SehatVaultBackend.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
}
