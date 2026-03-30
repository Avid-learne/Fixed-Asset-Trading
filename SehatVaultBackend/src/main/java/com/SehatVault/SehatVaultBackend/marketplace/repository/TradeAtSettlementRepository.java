package com.SehatVault.SehatVaultBackend.marketplace.repository;

import com.SehatVault.SehatVaultBackend.marketplace.entity.TradeAtSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TradeAtSettlementRepository extends JpaRepository<TradeAtSettlement, UUID> {

    /**
     * Find settlement for a specific trade
     */
    Optional<TradeAtSettlement> findByTradeId(UUID tradeId);

    /**
     * Find all settlements for a patient
     */
    List<TradeAtSettlement> findByPatientId(UUID patientId);

    /**
     * Find all settlements for a participation
     */
    Optional<TradeAtSettlement> findByParticipationId(UUID participationId);

    /**
     * Find all profitable settlements for a patient
     */
    @Query("SELECT t FROM TradeAtSettlement t WHERE t.patientId = :patientId AND t.tradeProfitLoss > 0")
    List<TradeAtSettlement> findProfitableSettlementsByPatientId(@Param("patientId") UUID patientId);

    /**
     * Get total HT issued to a patient from settlements
     */
    @Query("SELECT SUM(t.profitHtIssued) FROM TradeAtSettlement t WHERE t.patientId = :patientId")
    Optional<java.math.BigDecimal> getTotalProfitHtIssuedToPatient(@Param("patientId") UUID patientId);

    /**
     * Get total monthly HT issued to a patient
     */
    @Query("SELECT SUM(t.totalMonthlyHtIssued) FROM TradeAtSettlement t WHERE t.patientId = :patientId")
    Optional<java.math.BigDecimal> getTotalMonthlyHtIssuedToPatient(@Param("patientId") UUID patientId);
}
