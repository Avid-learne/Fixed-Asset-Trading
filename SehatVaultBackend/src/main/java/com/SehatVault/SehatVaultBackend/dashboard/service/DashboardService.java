package com.SehatVault.SehatVaultBackend.dashboard.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.entity.MintRecord;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.MintRecordRepository;
import com.SehatVault.SehatVaultBackend.dashboard.dto.AssetPricesDto;
import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
    private final MintRecordRepository mintRecordRepository;
    private final MarketplaceTradeRepository marketplaceTradeRepository;

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

        // Total AT minted for this hospital
        BigDecimal totalAtMinted = mintRecordRepository.sumTokensMintedByHospitalId(hospitalId);
        dto.setTotalAtMinted(totalAtMinted != null ? totalAtMinted : BigDecimal.ZERO);

        // Total HT allocated = sum of patient HT balances for this hospital
        BigDecimal totalHt = BigDecimal.ZERO;
        for (Patient p : patients) {
            PatientTokenBalance bal = patientTokenBalanceRepository.findByPatientId(p.getId()).orElse(null);
            if (bal != null && bal.getTotalHt() != null) {
                totalHt = totalHt.add(bal.getTotalHt());
            }
        }
        dto.setTotalHtAllocated(totalHt);

        // Total asset value (approved deposits)
        BigDecimal totalAssetValue = deposits.stream()
                .filter(d -> eq(d.getBankApprovalStatus(), "approved"))
                .map(AssetDeposit::getAssetValue)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAssetValue(totalAssetValue);

        // Trading volume & counts
        List<MarketplaceTrade> trades = marketplaceTradeRepository.findByHospitalIdOrderByStartTimeDesc(hospitalId);
        dto.setTotalTrades(trades.size());
        dto.setActiveTrades(trades.stream()
                .filter(t -> t.getStatus() == MarketplaceTrade.TradeStatus.ACTIVE)
                .count());
        BigDecimal tradingVolume = trades.stream()
                .map(MarketplaceTrade::getAmountInvested)
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTradingVolume(tradingVolume);

        // Monthly minting history (last 6 months)
        List<MintRecord> mintRecords = mintRecordRepository.findByHospitalIdOrderByTimestampDesc(hospitalId);
        dto.setMintingHistory(buildMonthlyMintData(mintRecords));

        // Monthly allocation history (last 6 months from profit distributions)
        dto.setAllocationHistory(buildMonthlyAllocationData(distributions));

        // Asset prices
        dto.setGoldPricePerGram(hospital.getGoldPricePerGram() != null ? hospital.getGoldPricePerGram() : 15000.0);
        dto.setSilverPricePerGram(hospital.getSilverPricePerGram() != null ? hospital.getSilverPricePerGram() : 250.0);

        // Asset distribution by type with PKR value
        Map<String, long[]> assetStats = new LinkedHashMap<>();
        for (AssetDeposit d : deposits) {
            if (eq(d.getBankApprovalStatus(), "approved")) {
                String type = d.getAssetType() != null ? d.getAssetType().toUpperCase(Locale.ROOT) : "OTHER";
                long[] stats = assetStats.computeIfAbsent(type, k -> new long[]{0, 0});
                stats[0]++;
                stats[1] += d.getAssetValue() != null ? d.getAssetValue().longValue() : 0;
            }
        }
        List<HospitalDashboardSummaryDto.AssetDistribution> distList = new ArrayList<>();
        for (Map.Entry<String, long[]> entry : assetStats.entrySet()) {
            HospitalDashboardSummaryDto.AssetDistribution ad = new HospitalDashboardSummaryDto.AssetDistribution();
            ad.setAssetType(entry.getKey());
            ad.setCount(entry.getValue()[0]);
            ad.setTotalValue(BigDecimal.valueOf(entry.getValue()[1]));
            distList.add(ad);
        }
        dto.setAssetDistribution(distList);

        return dto;
    }

    public AssetPricesDto getAssetPrices(String email) {
        User user = requireUser(email);
        Hospital hospital = hospitalRepository.findById(user.getHospitalId())
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));
        return new AssetPricesDto(
                hospital.getGoldPricePerGram() != null ? hospital.getGoldPricePerGram() : 15000.0,
                hospital.getSilverPricePerGram() != null ? hospital.getSilverPricePerGram() : 250.0
        );
    }

    public AssetPricesDto updateAssetPrices(String email, AssetPricesDto prices) {
        User user = requireUser(email);
        Hospital hospital = hospitalRepository.findById(user.getHospitalId())
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));
        hospital.setGoldPricePerGram(prices.getGoldPricePerGram());
        hospital.setSilverPricePerGram(prices.getSilverPricePerGram());
        hospital.setUpdatedAt(LocalDateTime.now());
        hospitalRepository.save(hospital);
        return prices;
    }

    private List<HospitalDashboardSummaryDto.MonthlyMintData> buildMonthlyMintData(List<MintRecord> records) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        Map<String, BigDecimal> monthly = new LinkedHashMap<>();
        // Init last 6 months
        for (int i = 5; i >= 0; i--) {
            LocalDateTime m = LocalDateTime.now().minusMonths(i);
            monthly.put(m.format(fmt), BigDecimal.ZERO);
        }

        for (MintRecord r : records) {
            if (r.getTimestamp() != null && r.getTimestamp().isAfter(sixMonthsAgo) && r.getTokensMinted() != null) {
                String key = r.getTimestamp().format(fmt);
                monthly.computeIfPresent(key, (k, v) -> v.add(r.getTokensMinted()));
            }
        }

        List<HospitalDashboardSummaryDto.MonthlyMintData> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : monthly.entrySet()) {
            HospitalDashboardSummaryDto.MonthlyMintData d = new HospitalDashboardSummaryDto.MonthlyMintData();
            d.setMonth(entry.getKey().split(" ")[0]); // "Apr"
            d.setMinted(entry.getValue());
            result.add(d);
        }
        return result;
    }

    private List<HospitalDashboardSummaryDto.MonthlyAllocationData> buildMonthlyAllocationData(List<ProfitDistribution> distributions) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        Map<String, BigDecimal> monthly = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime m = LocalDateTime.now().minusMonths(i);
            monthly.put(m.format(fmt), BigDecimal.ZERO);
        }

        for (ProfitDistribution d : distributions) {
            if (d.getCreatedAt() != null && d.getCreatedAt().isAfter(sixMonthsAgo) && d.getTotalProfit() != null) {
                String key = d.getCreatedAt().format(fmt);
                monthly.computeIfPresent(key, (k, v) -> v.add(d.getTotalProfit()));
            }
        }

        List<HospitalDashboardSummaryDto.MonthlyAllocationData> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : monthly.entrySet()) {
            HospitalDashboardSummaryDto.MonthlyAllocationData a = new HospitalDashboardSummaryDto.MonthlyAllocationData();
            a.setMonth(entry.getKey().split(" ")[0]);
            a.setAllocated(entry.getValue());
            result.add(a);
        }
        return result;
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
