package com.SehatVault.SehatVaultBackend.fractionalization.repository;

import com.SehatVault.SehatVaultBackend.fractionalization.entity.FractionalHtAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FractionalHtAllocationRepository extends JpaRepository<FractionalHtAllocation, UUID> {
    List<FractionalHtAllocation> findByBeneficiaryUserIdOrderByCreatedAtDesc(UUID beneficiaryUserId);

    List<FractionalHtAllocation> findByPrimaryUserIdOrderByCreatedAtDesc(UUID primaryUserId);

    @Query("SELECT a FROM FractionalHtAllocation a WHERE a.status = 'ACTIVE' AND a.nocExpiresAt IS NOT NULL AND a.nocExpiresAt <= :now")
    List<FractionalHtAllocation> findActiveExpired(@Param("now") LocalDateTime now);
}
