package com.SehatVault.SehatVaultBackend.marketplace.repository;

import com.SehatVault.SehatVaultBackend.marketplace.entity.MonthlyHtDistribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MonthlyHtDistributionRepository extends JpaRepository<MonthlyHtDistribution, UUID> {

    /**
     * Find all distributions for a patient
     */
    List<MonthlyHtDistribution> findByPatientId(UUID patientId);

    /**
     * Find pending distributions for a patient
     */
    @Query("SELECT m FROM MonthlyHtDistribution m WHERE m.patientId = :patientId AND m.isDistributed = false")
    List<MonthlyHtDistribution> findPendingDistributionsByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find distributions for a specific trade
     */
    List<MonthlyHtDistribution> findByTradeId(UUID tradeId);

    /**
     * Find distributions for a participation
     */
    List<MonthlyHtDistribution> findByParticipationId(UUID participationId);

    /**
     * Find pending distributions for a participation
     */
    @Query("SELECT m FROM MonthlyHtDistribution m WHERE m.participationId = :participationId AND m.isDistributed = false")
    List<MonthlyHtDistribution> findPendingDistributionsByParticipationId(
            @Param("participationId") UUID participationId);

    /**
     * Find distributions for a specific month
     */
    @Query("SELECT m FROM MonthlyHtDistribution m WHERE m.distributionMonth = :month")
    List<MonthlyHtDistribution> findDistributionsByMonth(@Param("month") LocalDate month);

    /**
     * Find pending distributions for a specific month
     */
    @Query("SELECT m FROM MonthlyHtDistribution m WHERE m.distributionMonth = :month AND m.isDistributed = false")
    List<MonthlyHtDistribution> findPendingDistributionsByMonth(@Param("month") LocalDate month);

    /**
     * Find distributions for a patient in a specific month
     */
    @Query("SELECT m FROM MonthlyHtDistribution m WHERE m.patientId = :patientId AND m.distributionMonth = :month")
    List<MonthlyHtDistribution> findDistributionsByPatientAndMonth(@Param("patientId") UUID patientId,
            @Param("month") LocalDate month);
}
