package com.SehatVault.SehatVaultBackend.activity.repository;

import com.SehatVault.SehatVaultBackend.activity.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {
    List<ActivityLog> findTop100ByUserIdOrderByTimestampDesc(UUID userId);
}
