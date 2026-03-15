package com.SehatVault.SehatVaultBackend.marketplace.repository;

import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarketplaceTradeRepository extends JpaRepository<MarketplaceTrade, UUID> {
    List<MarketplaceTrade> findByHospitalIdOrderByStartTimeDesc(UUID hospitalId);
    List<MarketplaceTrade> findByHospitalIdAndStatusOrderByOpeningPriceDesc(
            UUID hospitalId,
            MarketplaceTrade.TradeStatus status
    );
    List<MarketplaceTrade> findByHospitalIdAndStatusOrderByStartTimeDesc(
            UUID hospitalId,
            MarketplaceTrade.TradeStatus status
    );
}
