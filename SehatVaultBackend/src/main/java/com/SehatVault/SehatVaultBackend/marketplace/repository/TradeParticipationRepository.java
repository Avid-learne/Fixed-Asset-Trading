package com.SehatVault.SehatVaultBackend.marketplace.repository;

import com.SehatVault.SehatVaultBackend.marketplace.entity.TradeParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TradeParticipationRepository extends JpaRepository<TradeParticipation, UUID> {

    /**
     * Find all participations in a specific trade
     */
    List<TradeParticipation> findByTradeId(UUID tradeId);

    /**
     * Find all active participations in a trade
     */
    @Query("SELECT t FROM TradeParticipation t WHERE t.tradeId = :tradeId AND t.participationStatus = 'ACTIVE'")
    List<TradeParticipation> findActiveParticipationsByTradeId(@Param("tradeId") UUID tradeId);

    /**
     * Find all participations for a patient
     */
    List<TradeParticipation> findByPatientId(UUID patientId);

    /**
     * Find all active participations for a patient
     */
    @Query("SELECT t FROM TradeParticipation t WHERE t.patientId = :patientId AND t.participationStatus = 'ACTIVE'")
    List<TradeParticipation> findActiveParticipationsByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find a specific patient's participation in a trade
     */
    Optional<TradeParticipation> findByTradeIdAndPatientId(UUID tradeId, UUID patientId);

    /**
     * Find patient's participations for a specific asset
     */
    List<TradeParticipation> findByPatientIdAndAssetId(UUID patientId, UUID assetId);

    /**
     * Find all settled participations for a trade
     */
    @Query("SELECT t FROM TradeParticipation t WHERE t.tradeId = :tradeId AND t.participationStatus = 'SETTLED'")
    List<TradeParticipation> findSettledParticipationsByTradeId(@Param("tradeId") UUID tradeId);
}
