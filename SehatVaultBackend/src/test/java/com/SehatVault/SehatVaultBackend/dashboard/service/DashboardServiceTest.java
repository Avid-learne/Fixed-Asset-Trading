package com.SehatVault.SehatVaultBackend.dashboard.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.MintRecordRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.bank.entity.Bank;
import com.SehatVault.SehatVaultBackend.bank.repository.BankRepository;
import com.SehatVault.SehatVaultBackend.bankintegration.repository.PartnershipRepository;
import com.SehatVault.SehatVaultBackend.dashboard.dto.BankDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.ProfitDistributionRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private PatientTokenBalanceRepository patientTokenBalanceRepository;
    @Mock private WalletTransactionRepository walletTransactionRepository;
    @Mock private HealthCardRepository healthCardRepository;
    @Mock private AssetDepositRepository assetDepositRepository;
    @Mock private BankRepository bankRepository;
    @Mock private PartnershipRepository partnershipRepository;
    @Mock private HospitalRepository hospitalRepository;
    @Mock private ProfitDistributionRepository profitDistributionRepository;
    @Mock private MintRecordRepository mintRecordRepository;
    @Mock private MarketplaceTradeRepository marketplaceTradeRepository;
    @Mock private AssetPricingService assetPricingService;

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(
                userRepository,
                patientRepository,
                patientTokenBalanceRepository,
                walletTransactionRepository,
                healthCardRepository,
                assetDepositRepository,
                bankRepository,
                partnershipRepository,
                hospitalRepository,
                profitDistributionRepository,
                mintRecordRepository,
                marketplaceTradeRepository,
                assetPricingService
        );
    }

    @Test
    void getBankSummary_countsOnlyApprovedDepositsInTotals() {
        UUID bankId = UUID.randomUUID();

        Bank bank = new Bank();
        bank.setBankId(bankId);
        bank.setBankName("Faysal Bank");
        bank.setEmail("bank@example.com");

        AssetDeposit approvedDeposit = new AssetDeposit();
        approvedDeposit.setAssetValue(new BigDecimal("2057.51"));
        approvedDeposit.setBankApprovalStatus("approved");
        approvedDeposit.setCustodyConfirmedAt(LocalDateTime.now());
        approvedDeposit.setSubmittedAt(LocalDateTime.now());

        AssetDeposit approvedButNotConfirmedDeposit = new AssetDeposit();
        approvedButNotConfirmedDeposit.setAssetValue(new BigDecimal("5000.00"));
        approvedButNotConfirmedDeposit.setBankApprovalStatus("approved");
        approvedButNotConfirmedDeposit.setStatus("approved");
        approvedButNotConfirmedDeposit.setSubmittedAt(LocalDateTime.now());

        when(bankRepository.findByEmail(anyString())).thenReturn(Optional.of(bank));
        when(assetDepositRepository.findByBankIdOrderBySubmittedAtDesc(bankId))
            .thenReturn(List.of(approvedDeposit, approvedButNotConfirmedDeposit));
        when(partnershipRepository.findByBankIdOrderByCreatedAtDesc(bankId))
                .thenReturn(List.of());

        BankDashboardSummaryDto summary = dashboardService.getBankSummary("bank@example.com");

        assertEquals(1L, summary.getTotalDeposits());
        assertEquals(1L, summary.getApprovedReviews());
        assertEquals(0L, summary.getPendingReviews());
        assertEquals(new BigDecimal("2057.51"), summary.getTotalAssetValue());
    }
}