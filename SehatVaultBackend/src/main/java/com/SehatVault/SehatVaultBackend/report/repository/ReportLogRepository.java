package com.SehatVault.SehatVaultBackend.report.repository;

import com.SehatVault.SehatVaultBackend.report.entity.ReportLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportLogRepository extends JpaRepository<ReportLog, UUID> {
    List<ReportLog> findAllByOrderByGeneratedAtDesc();
    List<ReportLog> findByHospitalIdOrderByGeneratedAtDesc(UUID hospitalId);
    List<ReportLog> findByGeneratedByOrderByGeneratedAtDesc(UUID generatedBy);
    long countByHospitalId(UUID hospitalId);
}
