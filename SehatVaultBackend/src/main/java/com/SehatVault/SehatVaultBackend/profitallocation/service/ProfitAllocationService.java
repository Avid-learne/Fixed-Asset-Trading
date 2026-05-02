package com.SehatVault.SehatVaultBackend.profitallocation.service;

import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import com.SehatVault.SehatVaultBackend.wallet.service.TokenPriceService;
import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import com.SehatVault.SehatVaultBackend.marketplace.entity.TradeParticipation;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
import com.SehatVault.SehatVaultBackend.marketplace.repository.TradeParticipationRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.AllocationKpisDto;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ExecuteProfitAllocationRequest;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ExecuteProfitAllocationResponse;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.PatientAllocationPreviewDto;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ProfitAllocationPreviewResponse;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ProfitDistributionHistoryItemDto;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.ProfitableTradeDto;
import com.SehatVault.SehatVaultBackend.profitallocation.dto.TradeDistributionPreviewDto;
import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitAllocation;
import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitDistribution;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.AssetDepositRefRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.ProfitAllocationRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.ProfitDistributionRepository;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfitAllocationService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final MarketplaceTradeRepository marketplaceTradeRepository;
    private final TradeParticipationRepository tradeParticipationRepository;
    private final ProfitDistributionRepository profitDistributionRepository;
    private final ProfitAllocationRepository profitAllocationRepository;
    private final AssetDepositRefRepository assetDepositRefRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final HospitalRepository hospitalRepository;
    private final TokenPriceService tokenPriceService;
    private final CardRepository cardRepository;
    private final HealthCardRepository healthCardRepository;

    @Transactional(readOnly = true)
    public ProfitAllocationPreviewResponse getPreview(String email, BigDecimal requestedProfit) {
        User admin = findHospitalAdmin(email);
        UUID hospitalId = requireHospitalId(admin);

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        BigDecimal availableProfit = calculateAvailableProfit(hospitalId);
        BigDecimal totalProfit = normalizeTotalProfit(requestedProfit, availableProfit);

        // Read split percentages from hospital settings (defaults: 40/50/10)
        BigDecimal patientPercent = BigDecimal.valueOf(hospital.getPatientProfitPercent() != null ? hospital.getPatientProfitPercent() : 40.0);
        BigDecimal hospitalPercent = BigDecimal.valueOf(hospital.getHospitalProfitPercent() != null ? hospital.getHospitalProfitPercent() : 50.0);
        BigDecimal bankPercent = BigDecimal.valueOf(hospital.getBankProfitPercent() != null ? hospital.getBankProfitPercent() : 10.0);

        BigDecimal patientAmountPkr = totalProfit.multiply(patientPercent).divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);
        BigDecimal hospitalAmountPkr = totalProfit.multiply(hospitalPercent).divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);
        BigDecimal bankAmountPkr = totalProfit.multiply(bankPercent).divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);

        // Patients receive HT tokens based on their share
        BigDecimal tokenMintPoolPkr = patientAmountPkr;
        BigDecimal totalHt = tokenMintPoolPkr.divide(tokenPriceService.getHtPricePkr(), 6, RoundingMode.HALF_UP);

        List<PatientAllocationPreviewDto> allocations = buildAllocations(hospitalId, totalHt, tokenMintPoolPkr);
        BigDecimal totalAssetContributionPkr = allocations.stream()
            .map(PatientAllocationPreviewDto::getAssetContributionPkr)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ProfitAllocationPreviewResponse response = new ProfitAllocationPreviewResponse();
        response.setAvailableProfit(availableProfit);
        response.setTotalProfit(totalProfit);
        response.setPatientSharePercent(patientPercent);
        response.setHospitalSharePercent(hospitalPercent);
        response.setBankSharePercent(bankPercent);
        response.setPatientAmountPkr(patientAmountPkr);
        response.setHospitalAmountPkr(hospitalAmountPkr);
        response.setBankAmountPkr(bankAmountPkr);
        response.setTokenMintPoolPkr(tokenMintPoolPkr);
        response.setHtConversionRate(tokenPriceService.getHtPricePkr());
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
        distribution.setPatientsPercentage(preview.getPatientSharePercent());
        distribution.setHospitalPercentage(preview.getHospitalSharePercent());
        distribution.setBankPercentage(preview.getBankSharePercent());
        distribution.setHospitalOperations(preview.getHospitalAmountPkr());
        distribution.setHospitalEarning(preview.getHospitalAmountPkr());
        distribution.setBankLoanFunds(nz(preview.getBankAmountPkr()));
        distribution.setCreatedAt(LocalDateTime.now());
        distribution = profitDistributionRepository.save(distribution);

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId == null) {
            throw new IllegalArgumentException("HT token is not configured in tokens table");
        }

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

            // Also credit the Asset Health Card for separation from subscription HT.
            creditAssetHealthCard(item.getPatientId(), item.getHtAmount());

            Transaction tx = new Transaction();
            tx.setUserId(item.getUserId());
            tx.setTokenId(htTokenId);
            tx.setType(Transaction.TransactionType.HT_MINT);
            tx.setAmount(nz(item.getHtAmount()));
            tx.setDescription("HT minted from profit distribution " + distribution.getProfitDistributionId());
            tx.setSenderWalletAddress("HOSPITAL-TREASURY");
            tx.setReceiverWalletAddress(item.getWalletAddress());
                tx.setTransactionHash("0x" + String.format("%064x", System.currentTimeMillis()));
                tx.setStatus("CONFIRMED");
            tx.setTimestamp(LocalDateTime.now());
            walletTransactionRepository.save(tx);
        }

        ExecuteProfitAllocationResponse response = new ExecuteProfitAllocationResponse();
        response.setDistributionId(distribution.getProfitDistributionId());
        response.setRecipients(preview.getTotalRecipients());
        response.setTotalHtDistributed(preview.getTotalHtToDistribute());
        response.setPatientAmountPkr(preview.getPatientAmountPkr());
        response.setHospitalAmountPkr(preview.getHospitalAmountPkr());
        response.setBankAmountPkr(preview.getBankAmountPkr());
        response.setTokenMintPoolPkr(preview.getTokenMintPoolPkr());
        return response;
    }

    private void creditAssetHealthCard(UUID patientId, BigDecimal htCredit) {
        if (htCredit == null || htCredit.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        Card card = cardRepository.findByCardNameIgnoreCase("Asset Health Card").orElseGet(() -> {
            Card c = new Card();
            c.setCardName("Asset Health Card");
            return cardRepository.save(c);
        });

        HealthCard hc = healthCardRepository.findByPatientIdAndCardId(patientId, card.getCardId())
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    HealthCard created = new HealthCard();
                    created.setPatientId(patientId);
                    created.setCardId(card.getCardId());
                    created.setCardNum(generateCardNum());
                    created.setHtBalance(BigDecimal.ZERO);
                    created.setExpiryDate(LocalDate.now().plusYears(3));
                    created.setCvv(String.format("%03d", new Random().nextInt(1000)));
                    return healthCardRepository.save(created);
                });

        hc.setHtBalance(nz(hc.getHtBalance()).add(htCredit));
        healthCardRepository.save(hc);
    }

    @Transactional(readOnly = true)
    public List<ProfitDistributionHistoryItemDto> getHistory(String email) {
        User admin = findHospitalAdmin(email);
        UUID hospitalId = requireHospitalId(admin);

        Hospital hospital = hospitalRepository.findById(hospitalId).orElse(null);
        BigDecimal defaultHospitalPct = BigDecimal.valueOf(
                hospital != null && hospital.getHospitalProfitPercent() != null
                        ? hospital.getHospitalProfitPercent() : 50.0);
        BigDecimal defaultBankPct = BigDecimal.valueOf(
                hospital != null && hospital.getBankProfitPercent() != null
                        ? hospital.getBankProfitPercent() : 10.0);

        return profitDistributionRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId)
                .stream()
                .map(distribution -> {
                    List<ProfitAllocation> allocations = profitAllocationRepository
                            .findByProfitDistributionId(distribution.getProfitDistributionId());
                    BigDecimal totalHt = allocations.stream()
                            .map(ProfitAllocation::getAllocatedAmountHt)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal totalProfit = nz(distribution.getTotalProfit());
                    BigDecimal patientPct = nz(distribution.getPatientsPercentage());
                    BigDecimal hospitalPct = distribution.getHospitalPercentage() != null
                            ? distribution.getHospitalPercentage() : defaultHospitalPct;
                    BigDecimal bankPct = distribution.getBankPercentage() != null
                            ? distribution.getBankPercentage() : defaultBankPct;

                    ProfitDistributionHistoryItemDto dto = new ProfitDistributionHistoryItemDto();
                    dto.setDistributionId(distribution.getProfitDistributionId());
                    dto.setTimestamp(distribution.getCreatedAt());
                    dto.setTotalProfit(totalProfit);
                    dto.setPatientSharePercent(patientPct);
                    dto.setHospitalSharePercent(hospitalPct);
                    dto.setBankSharePercent(bankPct);
                    dto.setPatientAmountPkr(totalProfit.multiply(patientPct)
                            .divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP));
                    dto.setHospitalAmountPkr(nz(distribution.getHospitalEarning()).compareTo(BigDecimal.ZERO) > 0
                            ? distribution.getHospitalEarning()
                            : totalProfit.multiply(hospitalPct).divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP));
                    dto.setBankAmountPkr(nz(distribution.getBankLoanFunds()).compareTo(BigDecimal.ZERO) > 0
                            ? distribution.getBankLoanFunds()
                            : totalProfit.multiply(bankPct).divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP));
                    dto.setTotalHtDistributed(totalHt);
                    dto.setRecipients(allocations.size());
                    dto.setTradeId(distribution.getTradeId());
                    if (distribution.getTradeId() != null) {
                        dto.setTradeName(marketplaceTradeRepository.findById(distribution.getTradeId())
                                .map(MarketplaceTrade::getTradeTitle)
                                .orElse(null));
                    }
                    dto.setHospitalAtCredited(nz(distribution.getHospitalAtCredited()));
                    dto.setBankAtCredited(nz(distribution.getBankAtCredited()));
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

    // =================== PER-TRADE DISTRIBUTION ===================

    /** Top-of-page KPIs: cumulative AT credited to hospital and bank, undistributed
     *  profit, total HT minted to patients. Computed by summing past distributions
     *  rather than maintained as separate counters, so the math is always consistent
     *  with the source rows. */
    @Transactional(readOnly = true)
    public AllocationKpisDto getKpis(String email) {
        User admin = findHospitalAdmin(email);
        UUID hospitalId = requireHospitalId(admin);

        BigDecimal atPrice = tokenPriceService.getAtPricePkr();

        List<ProfitDistribution> distributions = profitDistributionRepository
                .findByHospitalIdOrderByCreatedAtDesc(hospitalId);

        BigDecimal hospitalAt = distributions.stream()
                .map(d -> nz(d.getHospitalAtCredited()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal bankAt = distributions.stream()
                .map(d -> nz(d.getBankAtCredited()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalHt = profitAllocationRepository.findAll().stream()
                // Filter to allocations belonging to this hospital's distributions.
                .filter(a -> distributions.stream()
                        .anyMatch(d -> d.getProfitDistributionId().equals(a.getProfitDistributionId())))
                .map(a -> nz(a.getAllocatedAmountHt()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MarketplaceTrade> profitableTrades = marketplaceTradeRepository
                .findByHospitalIdOrderByStartTimeDesc(hospitalId)
                .stream()
                .filter(t -> t.getStatus() == MarketplaceTrade.TradeStatus.CLOSED)
                .filter(t -> nz(t.getProfitLoss()).compareTo(BigDecimal.ZERO) > 0)
                .toList();

        long undistributedCount = profitableTrades.stream()
                .filter(t -> !profitDistributionRepository.existsByTradeId(t.getTradeId()))
                .count();

        BigDecimal availableProfitPkr = profitableTrades.stream()
                .filter(t -> !profitDistributionRepository.existsByTradeId(t.getTradeId()))
                .map(t -> nz(t.getProfitLoss()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal availableProfitAt = atPrice.compareTo(BigDecimal.ZERO) > 0
                ? availableProfitPkr.divide(atPrice, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal hospitalPkr = hospitalAt.multiply(atPrice).setScale(2, RoundingMode.HALF_UP);
        BigDecimal bankPkr = bankAt.multiply(atPrice).setScale(2, RoundingMode.HALF_UP);

        return AllocationKpisDto.builder()
                .availableProfitPkr(availableProfitPkr)
                .availableProfitAt(availableProfitAt)
                .hospitalProfitAt(hospitalAt)
                .hospitalProfitPkr(hospitalPkr)
                .bankProfitAt(bankAt)
                .bankProfitPkr(bankPkr)
                .totalHtMintedToPatients(totalHt)
                .distributionsCount(distributions.size())
                .profitableTradesCount(profitableTrades.size())
                .undistributedTradesCount((int) undistributedCount)
                .build();
    }

    /** List of CLOSED profitable trades for the hospital, with each row flagged as
     *  already-distributed or pending. */
    @Transactional(readOnly = true)
    public List<ProfitableTradeDto> getProfitableTrades(String email) {
        User admin = findHospitalAdmin(email);
        UUID hospitalId = requireHospitalId(admin);

        BigDecimal atPrice = tokenPriceService.getAtPricePkr();

        return marketplaceTradeRepository.findByHospitalIdOrderByStartTimeDesc(hospitalId).stream()
                .filter(t -> t.getStatus() == MarketplaceTrade.TradeStatus.CLOSED)
                .filter(t -> nz(t.getProfitLoss()).compareTo(BigDecimal.ZERO) > 0)
                .map(t -> {
                    ProfitDistribution existing = profitDistributionRepository
                            .findByTradeId(t.getTradeId()).orElse(null);
                    BigDecimal profitPkr = nz(t.getProfitLoss());
                    BigDecimal profitAt = atPrice.compareTo(BigDecimal.ZERO) > 0
                            ? profitPkr.divide(atPrice, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return ProfitableTradeDto.builder()
                            .tradeId(t.getTradeId())
                            .tradeName(t.getTradeTitle())
                            .assetType(parseInvestmentFromDescription(t.getInvestmentDescription()))
                            .tradeDate(t.getStartTime())
                            .closedAt(t.getEndTime())
                            .profitPkr(profitPkr)
                            .profitAt(profitAt)
                            .distributed(existing != null)
                            .distributedAt(existing == null ? null : existing.getCreatedAt())
                            .distributionId(existing == null ? null : existing.getProfitDistributionId())
                            .build();
                })
                .toList();
    }

    /** Build the per-trade preview: rows for each participant (proportional to their
     *  pre-trade allocation in this trade) plus a Hospital row and Bank row. */
    @Transactional(readOnly = true)
    public TradeDistributionPreviewDto getTradePreview(String email, UUID tradeId) {
        User admin = findHospitalAdmin(email);
        UUID hospitalId = requireHospitalId(admin);

        MarketplaceTrade trade = marketplaceTradeRepository.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("Trade not found"));
        if (!hospitalId.equals(trade.getHospitalId())) {
            throw new IllegalArgumentException("Trade does not belong to this hospital");
        }
        if (trade.getStatus() != MarketplaceTrade.TradeStatus.CLOSED) {
            throw new IllegalArgumentException("Trade is not closed yet");
        }
        BigDecimal profitPkr = nz(trade.getProfitLoss());
        if (profitPkr.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Trade did not produce a profit");
        }

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));
        BigDecimal patientPercent = BigDecimal.valueOf(hospital.getPatientProfitPercent() != null
                ? hospital.getPatientProfitPercent() : 40.0);
        BigDecimal hospitalPercent = BigDecimal.valueOf(hospital.getHospitalProfitPercent() != null
                ? hospital.getHospitalProfitPercent() : 50.0);
        BigDecimal bankPercent = BigDecimal.valueOf(hospital.getBankProfitPercent() != null
                ? hospital.getBankProfitPercent() : 10.0);

        BigDecimal atPrice = tokenPriceService.getAtPricePkr();
        BigDecimal htPrice = tokenPriceService.getHtPricePkr();

        BigDecimal profitAt = atPrice.compareTo(BigDecimal.ZERO) > 0
                ? profitPkr.divide(atPrice, 8, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal patientPoolAt = profitAt.multiply(patientPercent).divide(ONE_HUNDRED, 8, RoundingMode.HALF_UP);
        BigDecimal hospitalPoolAt = profitAt.multiply(hospitalPercent).divide(ONE_HUNDRED, 8, RoundingMode.HALF_UP);
        BigDecimal bankPoolAt = profitAt.multiply(bankPercent).divide(ONE_HUNDRED, 8, RoundingMode.HALF_UP);

        // Patient share is proportional to each participant's pre-trade allocation.
        // Settled participations have atAllocated already shrunk on a loss, but this is
        // a profitable trade so atAllocated == originalAt for every participant.
        List<TradeParticipation> participations = tradeParticipationRepository.findByTradeId(tradeId);
        BigDecimal totalParticipantAt = participations.stream()
                .map(p -> nz(p.getAtAllocated()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<TradeDistributionPreviewDto.Row> rows = new ArrayList<>();
        BigDecimal allocatedAt = BigDecimal.ZERO;
        for (int i = 0; i < participations.size(); i++) {
            TradeParticipation p = participations.get(i);
            boolean isLast = i == participations.size() - 1;
            BigDecimal contribution = nz(p.getAtAllocated());

            BigDecimal patientAt;
            if (totalParticipantAt.compareTo(BigDecimal.ZERO) <= 0) {
                patientAt = BigDecimal.ZERO;
            } else if (isLast) {
                // Last participant absorbs the rounding remainder.
                patientAt = patientPoolAt.subtract(allocatedAt).setScale(2, RoundingMode.HALF_UP);
            } else {
                patientAt = patientPoolAt.multiply(contribution)
                        .divide(totalParticipantAt, 10, RoundingMode.HALF_UP)
                        .setScale(2, RoundingMode.HALF_UP);
                allocatedAt = allocatedAt.add(patientAt);
            }
            BigDecimal patientPkr = patientAt.multiply(atPrice).setScale(2, RoundingMode.HALF_UP);
            BigDecimal patientHt = htPrice.compareTo(BigDecimal.ZERO) > 0
                    ? patientPkr.divide(htPrice, 4, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            BigDecimal sharePercent = totalParticipantAt.compareTo(BigDecimal.ZERO) > 0
                    ? contribution.multiply(ONE_HUNDRED).divide(totalParticipantAt, 4, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            String name = patientRepository.findById(p.getPatientId())
                    .flatMap(patient -> userRepository.findById(patient.getUserId()))
                    .map(User::getName)
                    .orElse("Unknown patient");

            rows.add(TradeDistributionPreviewDto.Row.builder()
                    .kind(TradeDistributionPreviewDto.RowKind.PATIENT)
                    .patientId(p.getPatientId())
                    .assetId(p.getAssetId())
                    .name(name)
                    .sharePercent(sharePercent)
                    .atAmount(patientAt)
                    .pkrAmount(patientPkr)
                    .htAmount(patientHt)
                    .build());
        }

        // Hospital row + Bank row. Each takes 100% of its pool.
        rows.add(TradeDistributionPreviewDto.Row.builder()
                .kind(TradeDistributionPreviewDto.RowKind.HOSPITAL)
                .name(hospital.getHospitalName() == null ? "Hospital" : hospital.getHospitalName())
                .sharePercent(ONE_HUNDRED)
                .atAmount(hospitalPoolAt.setScale(2, RoundingMode.HALF_UP))
                .pkrAmount(hospitalPoolAt.multiply(atPrice).setScale(2, RoundingMode.HALF_UP))
                .build());
        rows.add(TradeDistributionPreviewDto.Row.builder()
                .kind(TradeDistributionPreviewDto.RowKind.BANK)
                .name("Custodian Bank")
                .sharePercent(ONE_HUNDRED)
                .atAmount(bankPoolAt.setScale(2, RoundingMode.HALF_UP))
                .pkrAmount(bankPoolAt.multiply(atPrice).setScale(2, RoundingMode.HALF_UP))
                .build());

        return TradeDistributionPreviewDto.builder()
                .tradeId(tradeId)
                .tradeName(trade.getTradeTitle())
                .assetType(parseInvestmentFromDescription(trade.getInvestmentDescription()))
                .totalProfitPkr(profitPkr)
                .totalProfitAt(profitAt.setScale(2, RoundingMode.HALF_UP))
                .patientSharePercent(patientPercent)
                .hospitalSharePercent(hospitalPercent)
                .bankSharePercent(bankPercent)
                .patientPoolAt(patientPoolAt.setScale(2, RoundingMode.HALF_UP))
                .hospitalPoolAt(hospitalPoolAt.setScale(2, RoundingMode.HALF_UP))
                .bankPoolAt(bankPoolAt.setScale(2, RoundingMode.HALF_UP))
                .htConversionRate(htPrice)
                .atPrice(atPrice)
                .alreadyDistributed(profitDistributionRepository.existsByTradeId(tradeId))
                .rows(rows)
                .build();
    }

    /** Execute distribution for a single trade. Idempotent: refuses if the trade is
     *  already distributed. Mints HT to each participant patient (proportional to their
     *  funding share) and credits hospital/bank AT counters via ProfitDistribution. */
    @Transactional
    public ExecuteProfitAllocationResponse distributeTradeProfit(String email, UUID tradeId) {
        User admin = findHospitalAdmin(email);
        UUID hospitalId = requireHospitalId(admin);

        if (profitDistributionRepository.existsByTradeId(tradeId)) {
            throw new IllegalArgumentException("This trade has already been distributed");
        }

        TradeDistributionPreviewDto preview = getTradePreview(email, tradeId);

        ProfitDistribution distribution = new ProfitDistribution();
        distribution.setHospitalId(hospitalId);
        distribution.setTradeId(tradeId);
        distribution.setTotalProfit(preview.getTotalProfitPkr());
        distribution.setPatientsPercentage(preview.getPatientSharePercent());
        distribution.setHospitalPercentage(preview.getHospitalSharePercent());
        distribution.setBankPercentage(preview.getBankSharePercent());

        BigDecimal hospitalPkr = preview.getHospitalPoolAt().multiply(preview.getAtPrice())
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal bankPkr = preview.getBankPoolAt().multiply(preview.getAtPrice())
                .setScale(2, RoundingMode.HALF_UP);
        distribution.setHospitalOperations(hospitalPkr);
        distribution.setHospitalEarning(hospitalPkr);
        distribution.setBankLoanFunds(bankPkr);
        distribution.setHospitalAtCredited(preview.getHospitalPoolAt());
        distribution.setBankAtCredited(preview.getBankPoolAt());
        distribution.setCreatedAt(LocalDateTime.now());
        distribution = profitDistributionRepository.save(distribution);

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId == null) {
            throw new IllegalArgumentException("HT token is not configured in tokens table");
        }

        int patientCount = 0;
        BigDecimal totalHt = BigDecimal.ZERO;
        for (TradeDistributionPreviewDto.Row row : preview.getRows()) {
            if (row.getKind() != TradeDistributionPreviewDto.RowKind.PATIENT) {
                continue;
            }
            patientCount++;
            totalHt = totalHt.add(nz(row.getHtAmount()));

            ProfitAllocation allocation = new ProfitAllocation();
            allocation.setProfitDistributionId(distribution.getProfitDistributionId());
            allocation.setPatientId(row.getPatientId());
            allocation.setAssetId(row.getAssetId());
            allocation.setAllocatedPercentage(nz(row.getSharePercent()));
            allocation.setAllocatedAmountHt(nz(row.getHtAmount()));
            allocation.setTimestamp(LocalDateTime.now());
            profitAllocationRepository.save(allocation);

            // Credit HT to patient wallet + Asset Health Card + transaction record.
            PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(row.getPatientId())
                    .orElseGet(() -> {
                        PatientTokenBalance created = new PatientTokenBalance();
                        created.setPatientId(row.getPatientId());
                        created.setTotalAt(BigDecimal.ZERO);
                        created.setTotalHt(BigDecimal.ZERO);
                        created.setLastUpdated(LocalDateTime.now());
                        return created;
                    });
            balance.setTotalHt(nz(balance.getTotalHt()).add(nz(row.getHtAmount())));
            balance.setLastUpdated(LocalDateTime.now());
            patientTokenBalanceRepository.save(balance);

            creditAssetHealthCard(row.getPatientId(), row.getHtAmount());

            Patient patient = patientRepository.findById(row.getPatientId()).orElse(null);
            if (patient != null) {
                Transaction tx = new Transaction();
                tx.setUserId(patient.getUserId());
                tx.setTokenId(htTokenId);
                tx.setType(Transaction.TransactionType.HT_MINT);
                tx.setAmount(nz(row.getHtAmount()));
                tx.setDescription("HT minted from trade " + tradeId + " profit distribution");
                tx.setSenderWalletAddress("HOSPITAL-TREASURY");
                tx.setReceiverWalletAddress(patient.getWalletAddress() == null ? "" : patient.getWalletAddress());
                tx.setTransactionHash("0x" + String.format("%064x", System.currentTimeMillis()));
                tx.setStatus("CONFIRMED");
                tx.setTimestamp(LocalDateTime.now());
                walletTransactionRepository.save(tx);
            }
        }

        ExecuteProfitAllocationResponse response = new ExecuteProfitAllocationResponse();
        response.setDistributionId(distribution.getProfitDistributionId());
        response.setRecipients(patientCount);
        response.setTotalHtDistributed(totalHt);
        response.setPatientAmountPkr(preview.getPatientPoolAt().multiply(preview.getAtPrice())
                .setScale(2, RoundingMode.HALF_UP));
        response.setHospitalAmountPkr(hospitalPkr);
        response.setBankAmountPkr(bankPkr);
        response.setTokenMintPoolPkr(preview.getPatientPoolAt().multiply(preview.getAtPrice())
                .setScale(2, RoundingMode.HALF_UP));
        return response;
    }

    private String parseInvestmentFromDescription(String description) {
        if (description == null || description.isBlank()) return "";
        for (String line : description.split("\\n")) {
            if (line.startsWith("INV=")) return line.substring(4).trim();
        }
        return "";
    }

    // =================== END PER-TRADE ===================

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

    private String generateCardNum() {
        String num = String.format("%016d", System.currentTimeMillis() % 10000000000000000L);
        return healthCardRepository.existsByCardNum(num) ? generateCardNum() : num;
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
