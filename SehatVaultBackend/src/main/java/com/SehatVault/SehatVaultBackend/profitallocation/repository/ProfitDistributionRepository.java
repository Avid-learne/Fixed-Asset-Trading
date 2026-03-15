package com.SehatVault.SehatVaultBackend.profitallocation.repository;

import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitDistribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProfitDistributionRepository extends JpaRepository<ProfitDistribution, UUID> {
    List<ProfitDistribution> findByHospitalIdOrderByCreatedAtDesc(UUID hospitalId);
}
