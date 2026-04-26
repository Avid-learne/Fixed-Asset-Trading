package com.SehatVault.SehatVaultBackend.auth.repository;

import com.SehatVault.SehatVaultBackend.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * User Repository
 * Handles database operations for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    /**
     * Find user by email
     * @param email User's email
     * @return Optional containing User if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if email already exists
     * @param email User's email
     * @return true if email exists
     */
    boolean existsByEmail(String email);

    boolean existsByCnic(String cnic);

    boolean existsByCnicAndUserIdNot(String cnic, UUID userId);
}
