package com.SehatVault.SehatVaultBackend.dashboard.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.bank.entity.Bank;
import com.SehatVault.SehatVaultBackend.bank.repository.BankRepository;
import com.SehatVault.SehatVaultBackend.bankintegration.entity.Partnership;
import com.SehatVault.SehatVaultBackend.bankintegration.repository.PartnershipRepository;
import com.SehatVault.SehatVaultBackend.dashboard.dto.BankDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.HospitalDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.PatientDashboardSummaryDto;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitDistribution;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.ProfitDistributionRepository;
import com.SehatVault.SehatVaultBackend.wallet.dto.WalletTransactionDto;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final HealthCardRepository healthCardRepository;
    private final AssetDepositRepository assetDepositRepository;
    private final BankRepository bankRepository;
    private final PartnershipRepository partnershipRepository;
    private final HospitalRepository hospitalRepository;
    private final ProfitDistributionRepository profitDistributionRepository;

    public PatientDashboardSummaryDto getPatientSummary(String email) {
        User user = requireUser(email);
        Patient patient = patientRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));

        PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId()).orElse(null);
        List<AssetDeposit> deposits = assetDepositRepository.findByPatientIdOrderBySubmittedAtDesc(patient.getId());

        long pending = deposits.stream().filter(this::isPatientPending).count();
        long approved = deposits.stream().filter(d -> eq(d.getBankApprovalStatus(), "approved")).count();

        PatientDashboardSummaryDto dto = new PatientDashboardSummaryDto();
        dto.setHtBalance(balance != null && balance.getTotalHt() != null ? balance.getTotalHt() : BigDecimal.ZERO);
        dto.setPendingDeposits(pending);
        dto.setApprovedDeposits(approved);
        dto.setHealthCardCount(healthCardRepository.findByPatientId(patient.getId()).size());
        dto.setHasSubscription(Boolean.TRUE.equals(patient.getHasSubscription()));

        List<WalletTransactionDto> tx = walletTransactionRepository.findRecentByUserIdAndTokenSymbol(user.getUserId(), "HT")
                .stream()
                .limit(6)
                .map(row -> new WalletTransactionDto(
                        row.getTransactionId() != null ? row.getTransactionId().toString() : null,
                        row.getTokenSymbol(),
                        row.getTransactionType(),
                        row.getAmount(),
                        row.getDescription(),
                        row.getSenderWalletAddress(),
                        row.getReceiverWalletAddress(),
                        row.getBlockNumber(),
                        row.getTransactionHash(),
                        row.getStatus(),
                        row.getTimestamp() != null ? row.getTimestamp().toString() : null
                ))
                .collect(Collectors.toList());
        dto.setRecentHtTransactions(tx);
        return dto;
    }

    public BankDashboardSummaryDto getBankSummary(String email) {
        Bank bank = bankRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Bank profile not found"));
        List<AssetDeposit> deposits = assetDepositRepository.findByBankIdOrderBySubmittedAtDesc(bank.getBankId());

        BankDashboardSummaryDto dto = new BankDashboardSummaryDto();
        dto.setBankName(bank.getBankName());
        dto.setTotalDeposits(deposits.size());
        dto.setPendingReviews(deposits.stream().filter(d -> eq(d.getBankApprovalStatus(), "pending")).count());
        dto.setApprovedReviews(deposits.stream().filter(d -> eq(d.getBankApprovalStatus(), "approved")).count());
        dto.setRejectedReviews(deposits.stream().filter(d -> eq(d.getBankApprovalStatus(), "rejected")).count());
        dto.setTotalAssetValue(deposits.stream().map(AssetDeposit::getAssetValue).filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        dto.setActivePartnerships(partnershipRepository.findByBankIdOrderByCreatedAtDesc(bank.getBankId())
                .stream()
                .filter(p -> p.getIntegrationStatus() == Partnership.IntegrationStatus.APPROVED)
                .count());
        return dto;
    }

    public HospitalDashboardSummaryDto getHospitalSummary(String email) {
        User user = requireUser(email);
        UUID hospitalId = user.getHospitalId();
        if (hospitalId == null) {
            throw new IllegalArgumentException("No hospital linked to this account");
        }

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        List<Patient> patients = patientRepository.findByHospitalId(hospitalId);
        List<AssetDeposit> deposits = assetDepositRepository.findAllByHospitalId(hospitalId);
        List<ProfitDistribution> distributions = profitDistributionRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId);

        HospitalDashboardSummaryDto dto = new HospitalDashboardSummaryDto();
        dto.setHospitalName(hospital.getHospitalName());
        dto.setTotalPatients(patients.size());
        dto.setPendingDeposits(deposits.stream().filter(d -> eq(d.getStatus(), "pending")).count());
        dto.setApprovedDeposits(deposits.stream().filter(d -> eq(d.getBankApprovalStatus(), "approved")).count());
        dto.setActiveSubscriptions(patients.stream().filter(p -> Boolean.TRUE.equals(p.getHasSubscription())).count());
        dto.setTotalProfitDistributed(distributions.stream()
                .map(ProfitDistribution::getTotalProfit)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return dto;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private boolean eq(String value, String expected) {
        return value != null && value.trim().toLowerCase(Locale.ROOT).equals(expected);
    }

    private boolean isPatientPending(AssetDeposit d) {
        return eq(d.getStatus(), "pending") || eq(d.getBankApprovalStatus(), "pending");
    }
}
