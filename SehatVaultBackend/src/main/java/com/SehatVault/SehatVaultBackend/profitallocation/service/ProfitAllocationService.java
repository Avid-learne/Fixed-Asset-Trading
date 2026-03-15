package com.SehatVault.SehatVaultBackend.profitallocation.service;

import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ExecuteProfitAllocationRequest;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ExecuteProfitAllocationResponse;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.PatientAllocationPreviewDto;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ProfitAllocationPreviewResponse;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ProfitDistributionHistoryItemDto;
import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitAllocation;
import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitDistribution;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.AssetDepositRefRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.ProfitAllocationRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.ProfitDistributionRepository;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfitAllocationService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal HT_CONVERSION_RATE = new BigDecimal("10"); // PKR 10 = 1 HT

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final MarketplaceTradeRepository marketplaceTradeRepository;
    private final ProfitDistributionRepository profitDistributionRepository;
    private final ProfitAllocationRepository profitAllocationRepository;
    private final AssetDepositRefRepository assetDepositRefRepository;

    @Transactional(readOnly = true)
    public ProfitAllocationPreviewResponse getPreview(String email, BigDecimal requestedProfit) {
        User admin = findHospitalAdmin(email);
        UUID hospitalId = requireHospitalId(admin);

        BigDecimal availableProfit = calculateAvailableProfit(hospitalId);
        BigDecimal totalProfit = normalizeTotalProfit(requestedProfit, availableProfit);

        // Cash profit remains with hospital. HT mint pool is derived from full profit value.
        BigDecimal hospitalAmountPkr = totalProfit;
        BigDecimal patientAmountPkr = ZERO;
        BigDecimal tokenMintPoolPkr = totalProfit;
        BigDecimal totalHt = tokenMintPoolPkr.divide(HT_CONVERSION_RATE, 6, RoundingMode.HALF_UP);

        List<PatientAllocationPreviewDto> allocations = buildAllocations(hospitalId, totalHt, tokenMintPoolPkr);
        BigDecimal totalAssetContributionPkr = allocations.stream()
            .map(PatientAllocationPreviewDto::getAssetContributionPkr)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ProfitAllocationPreviewResponse response = new ProfitAllocationPreviewResponse();
        response.setAvailableProfit(availableProfit);
        response.setTotalProfit(totalProfit);
        response.setPatientSharePercent(ZERO);
        response.setHospitalSharePercent(ONE_HUNDRED);
        response.setPatientAmountPkr(patientAmountPkr);
        response.setHospitalAmountPkr(hospitalAmountPkr);
        response.setTokenMintPoolPkr(tokenMintPoolPkr);
        response.setHtConversionRate(HT_CONVERSION_RATE);
        response.setTotalHtToDistribute(totalHt);
        response.setTotalAssetContributionPkr(totalAssetContributionPkr);
        response.setTotalRecipients(allocations.size());
        response.setAllocations(allocations);
        return response;
    }

    @Transactional
    public ExecuteProfitAllocationResponse distribute(String email, ExecuteProfitAllocationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        ProfitAllocationPreviewResponse preview = getPreview(email, request.getTotalProfit());
        if (preview.getTotalRecipients() == null || preview.getTotalRecipients() == 0) {
            throw new IllegalArgumentException("No eligible patients with AT holdings for allocation");
        }

        User admin = findHospitalAdmin(email);
        UUID hospitalId = requireHospitalId(admin);

        ProfitDistribution distribution = new ProfitDistribution();
        distribution.setHospitalId(hospitalId);
        distribution.setTotalProfit(preview.getTotalProfit());
        distribution.setPatientsPercentage(ZERO);
        distribution.setHospitalOperations(preview.getHospitalAmountPkr());
        distribution.setHospitalEarning(preview.getHospitalAmountPkr());
        distribution.setBankLoanFunds(BigDecimal.ZERO);
        distribution.setCreatedAt(LocalDateTime.now());
        distribution = profitDistributionRepository.save(distribution);

        for (PatientAllocationPreviewDto item : preview.getAllocations()) {
            ProfitAllocation allocation = new ProfitAllocation();
            allocation.setProfitDistributionId(distribution.getProfitDistributionId());
            allocation.setPatientId(item.getPatientId());
            allocation.setAssetId(item.getAssetId());
            allocation.setAllocatedPercentage(item.getSharePercent());
            allocation.setAllocatedAmountHt(item.getHtAmount());
            allocation.setTimestamp(LocalDateTime.now());
            profitAllocationRepository.save(allocation);

            PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(item.getPatientId())
                    .orElseGet(() -> {
                        PatientTokenBalance created = new PatientTokenBalance();
                        created.setPatientId(item.getPatientId());
                        created.setTotalAt(BigDecimal.ZERO);
                        created.setTotalHt(BigDecimal.ZERO);
                        created.setLastUpdated(LocalDateTime.now());
                        return created;
                    });

            balance.setTotalHt(nz(balance.getTotalHt()).add(nz(item.getHtAmount())));
            balance.setLastUpdated(LocalDateTime.now());
            patientTokenBalanceRepository.save(balance);
        }

        ExecuteProfitAllocationResponse response = new ExecuteProfitAllocationResponse();
        response.setDistributionId(distribution.getProfitDistributionId());
        response.setRecipients(preview.getTotalRecipients());
        response.setTotalHtDistributed(preview.getTotalHtToDistribute());
        response.setPatientAmountPkr(preview.getPatientAmountPkr());
        response.setHospitalAmountPkr(preview.getHospitalAmountPkr());
        response.setTokenMintPoolPkr(preview.getTokenMintPoolPkr());
        return response;
    }

    @Transactional(readOnly = true)
    public List<ProfitDistributionHistoryItemDto> getHistory(String email) {
        User admin = findHospitalAdmin(email);
        UUID hospitalId = requireHospitalId(admin);

        return profitDistributionRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId)
                .stream()
                .map(distribution -> {
                    List<ProfitAllocation> allocations = profitAllocationRepository
                            .findByProfitDistributionId(distribution.getProfitDistributionId());
                    BigDecimal totalHt = allocations.stream()
                            .map(ProfitAllocation::getAllocatedAmountHt)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    ProfitDistributionHistoryItemDto dto = new ProfitDistributionHistoryItemDto();
                    dto.setDistributionId(distribution.getProfitDistributionId());
                    dto.setTimestamp(distribution.getCreatedAt());
                    dto.setTotalProfit(distribution.getTotalProfit());
                    dto.setPatientSharePercent(distribution.getPatientsPercentage());
                    dto.setPatientAmountPkr(distribution.getTotalProfit()
                            .multiply(distribution.getPatientsPercentage())
                            .divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP));
                    dto.setHospitalAmountPkr(distribution.getHospitalEarning());
                    dto.setTotalHtDistributed(totalHt);
                    dto.setRecipients(allocations.size());
                    return dto;
                })
                .toList();
    }

        private List<PatientAllocationPreviewDto> buildAllocations(UUID hospitalId, BigDecimal totalHt, BigDecimal tokenMintPoolPkr) {
        List<Patient> patients = patientRepository.findByHospitalId(hospitalId);

        List<PatientHolding> holdings = new ArrayList<>();
        for (Patient patient : patients) {
            UUID latestAssetId = assetDepositRefRepository.findLatestApprovedAssetIdByPatientId(patient.getId());
            if (latestAssetId == null) {
            latestAssetId = assetDepositRefRepository.findTopByPatientIdOrderBySubmittedAtDesc(patient.getId())
                .map(asset -> asset.getAssetId())
                .orElse(null);
            }
            if (latestAssetId == null) {
                continue;
            }

            String walletAddress = patient.getWalletAddress();
            if (walletAddress == null || walletAddress.isBlank()) {
            continue;
            }

            BigDecimal assetContribution = nz(assetDepositRefRepository
                .sumApprovedAssetValueByPatientId(patient.getId()));
            if (assetContribution.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            String name = userRepository.findById(patient.getUserId())
                    .map(User::getName)
                    .orElse("Unknown Patient");

            holdings.add(new PatientHolding(
                patient.getId(),
                patient.getUserId(),
                latestAssetId,
                name,
                walletAddress,
                assetContribution
            ));
        }

        BigDecimal totalContribution = holdings.stream()
            .map(PatientHolding::assetContributionPkr)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalContribution.compareTo(BigDecimal.ZERO) <= 0) {
            return List.of();
        }

        List<PatientAllocationPreviewDto> allocations = new ArrayList<>();
        BigDecimal allocatedShare = BigDecimal.ZERO;
        BigDecimal allocatedHt = BigDecimal.ZERO;
        BigDecimal allocatedPkrValue = BigDecimal.ZERO;

        for (int i = 0; i < holdings.size(); i++) {
            PatientHolding holding = holdings.get(i);
            boolean isLast = i == holdings.size() - 1;

            BigDecimal sharePercent;
            BigDecimal htAmount;
            BigDecimal pkrValue;

            if (isLast) {
            // Force exact totals so no HT remainder is left undistributed.
            sharePercent = ONE_HUNDRED.subtract(allocatedShare);
            htAmount = totalHt.subtract(allocatedHt);
            pkrValue = tokenMintPoolPkr.subtract(allocatedPkrValue);
            } else {
            sharePercent = holding.assetContributionPkr
                .multiply(ONE_HUNDRED)
                .divide(totalContribution, 8, RoundingMode.HALF_UP);
            htAmount = totalHt.multiply(holding.assetContributionPkr)
                .divide(totalContribution, 8, RoundingMode.HALF_UP);
            pkrValue = tokenMintPoolPkr.multiply(holding.assetContributionPkr)
                .divide(totalContribution, 8, RoundingMode.HALF_UP);

            allocatedShare = allocatedShare.add(sharePercent);
            allocatedHt = allocatedHt.add(htAmount);
            allocatedPkrValue = allocatedPkrValue.add(pkrValue);
            }

            PatientAllocationPreviewDto dto = new PatientAllocationPreviewDto();
            dto.setPatientId(holding.patientId);
            dto.setUserId(holding.userId);
            dto.setAssetId(holding.assetId);
            dto.setPatientName(holding.name);
            dto.setWalletAddress(holding.walletAddress);
            dto.setAssetContributionPkr(holding.assetContributionPkr);
            dto.setSharePercent(sharePercent.max(BigDecimal.ZERO));
            dto.setHtAmount(htAmount.max(BigDecimal.ZERO));
            dto.setPkrValue(pkrValue.max(BigDecimal.ZERO));
            allocations.add(dto);
        }

        return allocations;
    }

    private BigDecimal calculateAvailableProfit(UUID hospitalId) {
        BigDecimal totalProfitableTradePnl = marketplaceTradeRepository.findByHospitalIdOrderByStartTimeDesc(hospitalId)
            .stream()
            .map(MarketplaceTrade::getProfitLoss)
            .map(this::nz)
            .filter(value -> value.compareTo(BigDecimal.ZERO) > 0)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal alreadyDistributed = profitDistributionRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId)
            .stream()
            .map(ProfitDistribution::getTotalProfit)
            .map(this::nz)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal available = totalProfitableTradePnl.subtract(alreadyDistributed);
        return available.compareTo(BigDecimal.ZERO) > 0 ? available : BigDecimal.ZERO;
    }

    private User findHospitalAdmin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == null || user.getRole().getRoleName() != Role.RoleType.hospital_admin) {
            throw new IllegalArgumentException("Only hospital admin can access profit allocation");
        }

        return user;
    }

    private UUID requireHospitalId(User user) {
        if (user.getHospitalId() == null) {
            throw new IllegalArgumentException("Hospital is not linked to this account");
        }
        return user.getHospitalId();
    }

    private BigDecimal normalizeTotalProfit(BigDecimal requestedProfit, BigDecimal availableProfit) {
        BigDecimal selected = requestedProfit == null || requestedProfit.compareTo(BigDecimal.ZERO) <= 0
                ? availableProfit
                : requestedProfit;
        if (selected.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("No positive profit available for allocation");
        }
        return selected;
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private record PatientHolding(
            UUID patientId,
            UUID userId,
            UUID assetId,
            String name,
            String walletAddress,
            BigDecimal assetContributionPkr
    ) {}
}
