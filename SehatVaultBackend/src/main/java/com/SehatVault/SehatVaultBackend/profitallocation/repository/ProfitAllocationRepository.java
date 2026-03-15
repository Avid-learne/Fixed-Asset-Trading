package com.SehatVault.SehatVaultBackend.profitallocation.repository;

import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitAllocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProfitAllocationRepository extends JpaRepository<ProfitAllocation, UUID> {
    List<ProfitAllocation> findByProfitDistributionId(UUID profitDistributionId);
}
