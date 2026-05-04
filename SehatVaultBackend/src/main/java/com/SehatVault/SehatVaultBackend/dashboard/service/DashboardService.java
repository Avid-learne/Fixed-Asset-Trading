package com.SehatVault.SehatVaultBackend.dashboard.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.entity.MintRecord;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.MintRecordRepository;
import com.SehatVault.SehatVaultBackend.dashboard.dto.AssetPricesDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.SuperAdminBankDetailsDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.SuperAdminHospitalDetailsDto;
import com.SehatVault.SehatVaultBackend.dashboard.dto.SuperAdminDashboardSummaryDto;
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
import java.util.function.Function;
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
    private final AssetPricingService assetPricingService;

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
        dto.setTotalDeposits(deposits.stream().filter(d -> d.getCustodyConfirmedAt() != null).count());
        dto.setPendingReviews(deposits.stream().filter(d -> eq(d.getBankApprovalStatus(), "pending")).count());
        dto.setApprovedReviews(deposits.stream().filter(d -> eq(d.getBankApprovalStatus(), "approved")).count());
        dto.setRejectedReviews(deposits.stream().filter(d -> eq(d.getBankApprovalStatus(), "rejected")).count());
        dto.setTotalAssetValue(deposits.stream()
            .filter(d -> d.getCustodyConfirmedAt() != null)
                .map(AssetDeposit::getAssetValue).filter(v -> v != null)
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
        AssetPricesDto livePrices = assetPricingService.getLiveAssetPrices();
        dto.setGoldPricePerGram(livePrices.getGoldPricePerGram());
        dto.setSilverPricePerGram(livePrices.getSilverPricePerGram());

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
        return assetPricingService.getLiveAssetPrices();
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

        public SuperAdminDashboardSummaryDto getSuperAdminSummary(String email) {
        requireSuperAdmin(email, "Only super admins can access the system summary");

        List<Hospital> hospitals = hospitalRepository.findAll();
        List<Bank> banks = bankRepository.findAll();
        List<Patient> patients = patientRepository.findAll();
        List<MarketplaceTrade> trades = marketplaceTradeRepository.findAll();
        List<ProfitDistribution> distributions = profitDistributionRepository.findAll();
        List<MintRecord> mintRecords = mintRecordRepository.findAll();

        Map<UUID, Long> patientCountsByHospital = patients.stream()
            .filter(patient -> patient.getHospitalId() != null)
            .collect(Collectors.groupingBy(Patient::getHospitalId, Collectors.counting()));

        Map<UUID, Long> partnershipCountsByBank = partnershipRepository.findAll().stream()
            .filter(partnership -> partnership.getBankId() != null)
            .filter(partnership -> partnership.getIntegrationStatus() == Partnership.IntegrationStatus.APPROVED)
            .collect(Collectors.groupingBy(Partnership::getBankId, Collectors.counting()));

        Map<UUID, Hospital> hospitalById = hospitals.stream()
            .filter(hospital -> hospital.getHospitalId() != null)
            .collect(Collectors.toMap(Hospital::getHospitalId, Function.identity(), (left, right) -> left, LinkedHashMap::new));

        SuperAdminDashboardSummaryDto dto = new SuperAdminDashboardSummaryDto();
        dto.setTotalHospitals(hospitals.size());
        dto.setActiveHospitals(hospitals.stream().filter(h -> h.getVerificationStatus() == Hospital.VerificationStatus.VERIFIED).count());
        dto.setPendingHospitals(hospitals.stream().filter(h -> h.getVerificationStatus() == Hospital.VerificationStatus.PENDING).count());
        dto.setDisabledHospitals(hospitals.stream().filter(h -> h.getVerificationStatus() == Hospital.VerificationStatus.REJECTED).count());

        dto.setTotalBanks(banks.size());
        dto.setActiveBanks(banks.stream().filter(b -> b.getVerificationStatus() == Bank.VerificationStatus.VERIFIED).count());
        dto.setPendingBanks(banks.stream().filter(b -> b.getVerificationStatus() == Bank.VerificationStatus.PENDING).count());
        dto.setDisabledBanks(banks.stream().filter(b -> b.getVerificationStatus() == Bank.VerificationStatus.REJECTED).count());

        dto.setTotalPatients(patients.size());
        dto.setActivePatients(patients.size());

        dto.setTotalATMinted(mintRecords.stream()
            .filter(record -> record.getTokensMinted() != null)
            .filter(record -> record.getStatus() == null || !"FAILED".equalsIgnoreCase(record.getStatus()))
            .map(MintRecord::getTokensMinted)
            .reduce(BigDecimal.ZERO, BigDecimal::add));

        dto.setTotalHTIssued(patientTokenBalanceRepository.findAll().stream()
            .map(balance -> balance.getTotalHt() != null ? balance.getTotalHt() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add));

        dto.setTotalRevenue(distributions.stream()
            .map(ProfitDistribution::getTotalProfit)
            .filter(value -> value != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add));

        dto.setTotalTransactionVolume(trades.stream()
            .map(MarketplaceTrade::getAmountInvested)
            .filter(value -> value != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add));

        for (Hospital hospital : hospitals) {
            SuperAdminDashboardSummaryDto.HospitalOverview row = new SuperAdminDashboardSummaryDto.HospitalOverview();
            row.setHospitalId(hospital.getHospitalId());
            row.setHospitalName(hospital.getHospitalName());
            row.setRegistrationNumber(hospital.getRegistrationNum());
            row.setEmail(hospital.getEmail());
            row.setContactNum(hospital.getContactNum());
            row.setAddress(hospital.getAddress());
            row.setPatientCount(patientCountsByHospital.getOrDefault(hospital.getHospitalId(), 0L));
            row.setVerificationStatus(hospital.getVerificationStatus() != null ? hospital.getVerificationStatus().name() : "PENDING");
            row.setTotalAssets(nz(assetDepositRepository.sumAssetValueByHospitalIdAndCustodyConfirmedAtIsNotNull(hospital.getHospitalId())));
            row.setTotalAT(nz(mintRecordRepository.sumTokensMintedByHospitalId(hospital.getHospitalId())));
            row.setCreatedAt(hospital.getCreatedAt());
            dto.getHospitals().add(row);
        }

        for (Bank bank : banks) {
            SuperAdminDashboardSummaryDto.BankOverview row = new SuperAdminDashboardSummaryDto.BankOverview();
            row.setBankId(bank.getBankId());
            row.setBankName(bank.getBankName());
            row.setActivePartnerships(partnershipCountsByBank.getOrDefault(bank.getBankId(), 0L));
            row.setVerificationStatus(bank.getVerificationStatus() != null ? bank.getVerificationStatus().name() : "PENDING");
            row.setTotalDeposits(nz(assetDepositRepository.sumAssetValueByBankIdAndCustodyConfirmedAtIsNotNull(bank.getBankId())));
            row.setCreatedAt(bank.getCreatedAt());
            dto.getBanks().add(row);
        }

        for (MarketplaceTrade trade : trades) {
            SuperAdminDashboardSummaryDto.MarketplaceTradeOverview row = new SuperAdminDashboardSummaryDto.MarketplaceTradeOverview();
            row.setTradeId(trade.getTradeId());
            row.setHospitalId(trade.getHospitalId());
            row.setHospitalName(hospitalById.getOrDefault(trade.getHospitalId(), new Hospital()).getHospitalName());
            row.setTradeTitle(trade.getTradeTitle());
            row.setTradeType(trade.getTradeType() != null ? trade.getTradeType().name() : null);
            row.setStatus(trade.getStatus() != null ? trade.getStatus().name() : "ACTIVE");
            row.setAmountInvested(trade.getAmountInvested() != null ? trade.getAmountInvested() : BigDecimal.ZERO);
            row.setProfitLoss(trade.getProfitLoss() != null ? trade.getProfitLoss() : BigDecimal.ZERO);
            row.setStartTime(trade.getStartTime());
            row.setEndTime(trade.getEndTime());
            dto.getMarketplaceTrades().add(row);
        }

        return dto;
        }

    public SuperAdminHospitalDetailsDto getSuperAdminHospitalDetails(String email, UUID hospitalId) {
        requireSuperAdmin(email, "Only super admins can access hospital details");

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        SuperAdminHospitalDetailsDto dto = new SuperAdminHospitalDetailsDto();
        dto.setHospitalId(hospital.getHospitalId());
        dto.setHospitalName(hospital.getHospitalName());
        dto.setRegistrationNumber(hospital.getRegistrationNum());
        dto.setAddress(hospital.getAddress());
        dto.setEmail(hospital.getEmail());
        dto.setContactNum(hospital.getContactNum());
        dto.setCity(hospital.getCity());
        dto.setVerificationStatus(hospital.getVerificationStatus() != null ? hospital.getVerificationStatus().name() : "PENDING");
        dto.setCreatedAt(hospital.getCreatedAt());

        dto.setPatientCount(patientRepository.findByHospitalId(hospitalId).size());
        dto.setTotalDeposits(assetDepositRepository.countByHospitalIdAndCustodyConfirmedAtIsNotNull(hospitalId));
        dto.setTotalAssets(nz(assetDepositRepository.sumAssetValueByHospitalIdAndCustodyConfirmedAtIsNotNull(hospitalId)));
        dto.setTotalAT(nz(mintRecordRepository.sumTokensMintedByHospitalId(hospitalId)));

        List<Partnership> links = partnershipRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId);
        for (Partnership link : links) {
            Bank bank = bankRepository.findById(link.getBankId()).orElse(null);
            if (bank == null) continue;

            SuperAdminHospitalDetailsDto.LinkedBank row = new SuperAdminHospitalDetailsDto.LinkedBank();
            row.setPartnershipId(link.getPartnershipId());
            row.setBankId(bank.getBankId());
            row.setBankName(bank.getBankName());
            row.setBankVerificationStatus(bank.getVerificationStatus() != null ? bank.getVerificationStatus().name() : "PENDING");
            row.setIntegrationStatus(link.getIntegrationStatus() != null ? link.getIntegrationStatus().name() : "PENDING");
            row.setLinkedAt(link.getCreatedAt());
            row.setTotalDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndCustodyConfirmedAtIsNotNull(bank.getBankId(), hospitalId));
            row.setApprovedDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndStatus(bank.getBankId(), hospitalId, "approved"));
            row.setPendingDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndStatus(bank.getBankId(), hospitalId, "pending"));
            row.setTotalAssetValuePkr(nz(assetDepositRepository.sumAssetValueByBankIdAndHospitalIdAndCustodyConfirmedAtIsNotNull(bank.getBankId(), hospitalId)));
            dto.getLinkedBanks().add(row);
        }

        return dto;
    }

    public SuperAdminBankDetailsDto getSuperAdminBankDetails(String email, UUID bankId) {
        requireSuperAdmin(email, "Only super admins can access bank details");

        Bank bank = bankRepository.findById(bankId)
                .orElseThrow(() -> new IllegalArgumentException("Bank not found"));

        SuperAdminBankDetailsDto dto = new SuperAdminBankDetailsDto();
        dto.setBankId(bank.getBankId());
        dto.setBankName(bank.getBankName());
        dto.setRegistration(bank.getRegistration());
        dto.setSwiftCode(bank.getSwiftCode());
        dto.setBankCode(bank.getBankCode());
        dto.setAddress(bank.getAddress());
        dto.setEmail(bank.getEmail());
        dto.setContactNum(bank.getContactNum());
        dto.setCity(bank.getCity());
        dto.setVerificationStatus(bank.getVerificationStatus() != null ? bank.getVerificationStatus().name() : "PENDING");
        dto.setCreatedAt(bank.getCreatedAt());

        List<Partnership> links = partnershipRepository.findByBankIdOrderByCreatedAtDesc(bankId);
        dto.setActivePartnerships(links.stream()
                .filter(link -> link.getIntegrationStatus() == Partnership.IntegrationStatus.APPROVED)
                .count());
        dto.setTotalDeposits(assetDepositRepository.countByBankIdAndCustodyConfirmedAtIsNotNull(bankId));
        dto.setTotalAssetValuePkr(nz(assetDepositRepository.sumAssetValueByBankIdAndCustodyConfirmedAtIsNotNull(bankId)));

        for (Partnership link : links) {
            Hospital hospital = hospitalRepository.findById(link.getHospitalId()).orElse(null);
            if (hospital == null) continue;

            SuperAdminBankDetailsDto.LinkedHospital row = new SuperAdminBankDetailsDto.LinkedHospital();
            row.setPartnershipId(link.getPartnershipId());
            row.setHospitalId(hospital.getHospitalId());
            row.setHospitalName(hospital.getHospitalName());
            row.setHospitalVerificationStatus(hospital.getVerificationStatus() != null ? hospital.getVerificationStatus().name() : "PENDING");
            row.setIntegrationStatus(link.getIntegrationStatus() != null ? link.getIntegrationStatus().name() : "PENDING");
            row.setLinkedAt(link.getCreatedAt());
            row.setTotalDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndCustodyConfirmedAtIsNotNull(bankId, hospital.getHospitalId()));
            row.setApprovedDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndStatus(bankId, hospital.getHospitalId(), "approved"));
            row.setPendingDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndStatus(bankId, hospital.getHospitalId(), "pending"));
            row.setTotalAssetValuePkr(nz(assetDepositRepository.sumAssetValueByBankIdAndHospitalIdAndCustodyConfirmedAtIsNotNull(bankId, hospital.getHospitalId())));
            dto.getLinkedHospitals().add(row);
        }

        return dto;
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

    private User requireSuperAdmin(String email, String message) {
        User user = requireUser(email);
        if (user.getRole() == null || user.getRole().getRoleName() != com.SehatVault.SehatVaultBackend.auth.entity.Role.RoleType.admin) {
            throw new IllegalArgumentException(message);
        }
        return user;
    }

    private boolean eq(String value, String expected) {
        return value != null && value.trim().toLowerCase(Locale.ROOT).equals(expected);
    }

    private boolean isPatientPending(AssetDeposit d) {
        return eq(d.getStatus(), "pending") || eq(d.getBankApprovalStatus(), "pending");
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
