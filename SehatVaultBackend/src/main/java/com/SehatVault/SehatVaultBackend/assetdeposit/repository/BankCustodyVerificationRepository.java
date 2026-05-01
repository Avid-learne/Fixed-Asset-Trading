package com.SehatVault.SehatVaultBackend.assetdeposit.repository;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.entity.BankCustodyVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BankCustodyVerificationRepository extends JpaRepository<BankCustodyVerification, String> {
    Optional<BankCustodyVerification> findByDeposit(AssetDeposit deposit);
    List<BankCustodyVerification> findByBankStaffId(String bankStaffId);
    List<BankCustodyVerification> findByAssetCondition(String assetCondition);
}
