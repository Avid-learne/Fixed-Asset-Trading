package com.SehatVault.SehatVaultBackend.profitallocation.repository;

import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitDistribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfitDistributionRepository extends JpaRepository<ProfitDistribution, UUID> {
    List<ProfitDistribution> findByHospitalIdOrderByCreatedAtDesc(UUID hospitalId);

    /** Returns the distribution for a specific trade, if one exists. Per-trade idempotency:
     *  if present, the trade has already been distributed and re-distribution is refused. */
    Optional<ProfitDistribution> findByTradeId(UUID tradeId);

    boolean existsByTradeId(UUID tradeId);

    List<ProfitDistribution> findByHospitalIdAndTradeIdIsNotNullOrderByCreatedAtDesc(UUID hospitalId);
}
