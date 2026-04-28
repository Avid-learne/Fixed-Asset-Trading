package com.SehatVault.SehatVaultBackend.auth.filter;

import com.SehatVault.SehatVaultBackend.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * JWT Authentication Filter
 * Validates JWT tokens from Authorization header on each request
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Short-circuit: allow unauthenticated access to public asset prices endpoints
        String path = request.getRequestURI();
        if (path != null && (path.equals("/api/dashboard/asset-prices") || path.equals("/api/dashboard/hospital/asset-prices"))) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String authHeader = request.getHeader("Authorization");
            String token = null;
            String email = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                log.debug("JWT Token found in request");

                try {
                    if (jwtUtil.validateToken(token)) {
                        email = jwtUtil.getEmailFromToken(token);
                        log.debug("Token validated for email: {}", email);

                        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                            UsernamePasswordAuthenticationToken authentication = 
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails, 
                                            null, 
                                            userDetails.getAuthorities()
                                    );

                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            log.debug("Authentication set for user: {}", email);
                        }
                    } else {
                        log.warn("Token validation failed");
                    }
                } catch (Exception e) {
                    log.error("Cannot validate JWT token: {}", e.getMessage());
                }
            } else {
                log.debug("No Bearer token found in Authorization header");
            }
        } catch (Exception e) {
            log.error("Cannot process JWT filter: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
