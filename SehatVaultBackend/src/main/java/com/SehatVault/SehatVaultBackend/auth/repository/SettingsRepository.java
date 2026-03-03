package com.SehatVault.SehatVaultBackend.auth.repository;

import com.SehatVault.SehatVaultBackend.auth.entity.Settings;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Settings Repository
 * Handles database operations for Settings entity
 */
@Repository
public interface SettingsRepository extends JpaRepository<Settings, UUID> {
    
    /**
     * Find settings by user
     * @param user User object
     * @return Optional containing Settings if found
     */
    Optional<Settings> findByUser(User user);
}
