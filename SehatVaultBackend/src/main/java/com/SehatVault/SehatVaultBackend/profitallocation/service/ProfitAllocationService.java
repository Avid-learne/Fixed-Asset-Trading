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
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.blockchain.model.BlockchainTxRef;
import com.SehatVault.SehatVaultBackend.blockchain.service.TokenContractGateway;
import com.SehatVault.SehatVaultBackend.blockchain.util.TokenUnitConverter;
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
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfitAllocationService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

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
    private final TokenContractGateway tokenContractGateway;

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

                BlockchainTxRef chainTx = tokenContractGateway.mintHT(
                    item.getWalletAddress(),
                    TokenUnitConverter.toBaseUnits(nz(item.getHtAmount()), 18)
                );

            Transaction tx = new Transaction();
            tx.setUserId(item.getUserId());
            tx.setTokenId(htTokenId);
            tx.setType(Transaction.TransactionType.HT_MINT);
            tx.setAmount(nz(item.getHtAmount()));
            tx.setDescription("HT minted from profit distribution " + distribution.getProfitDistributionId());
            tx.setSenderWalletAddress("HOSPITAL-TREASURY");
            tx.setReceiverWalletAddress(item.getWalletAddress());
            tx.setTransactionHash(chainTx.getTransactionHash());
            tx.setBlockNumber(chainTx.getBlockNumber());
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

    @Transactional(readOnly = true)
    public ProfitAllocationPreviewResponse getTradePreview(UUID tradeId, BigDecimal requestedProfit) {
        MarketplaceTrade trade = marketplaceTradeRepository.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("Trade not found"));
        UUID hospitalId = trade.getHospitalId();

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        BigDecimal availableProfit = calculateAvailableTradeProfit(trade);
        BigDecimal totalProfit = normalizeTotalProfit(requestedProfit, availableProfit);

        BigDecimal patientPercent = BigDecimal.valueOf(hospital.getPatientProfitPercent() != null ? hospital.getPatientProfitPercent() : 40.0);
        BigDecimal hospitalPercent = BigDecimal.valueOf(hospital.getHospitalProfitPercent() != null ? hospital.getHospitalProfitPercent() : 50.0);
        BigDecimal bankPercent = BigDecimal.valueOf(hospital.getBankProfitPercent() != null ? hospital.getBankProfitPercent() : 10.0);

        BigDecimal patientAmountPkr = totalProfit.multiply(patientPercent).divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);
        BigDecimal hospitalAmountPkr = totalProfit.multiply(hospitalPercent).divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);
        BigDecimal bankAmountPkr = totalProfit.multiply(bankPercent).divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP);

        BigDecimal tokenMintPoolPkr = patientAmountPkr;
        BigDecimal totalHt = tokenMintPoolPkr.divide(tokenPriceService.getHtPricePkr(), 6, RoundingMode.HALF_UP);

        List<PatientAllocationPreviewDto> allocations = buildTradeAllocations(tradeId, totalHt, tokenMintPoolPkr);
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
    public ExecuteProfitAllocationResponse distributeTradeProfit(UUID tradeId, BigDecimal requestedProfit) {
        if (tradeId == null) {
            throw new IllegalArgumentException("tradeId is required");
        }

        if (profitDistributionRepository.existsByTradeId(tradeId)) {
            throw new IllegalArgumentException("Profit has already been distributed for this trade");
        }

        ProfitAllocationPreviewResponse preview = getTradePreview(tradeId, requestedProfit);
        if (preview.getTotalRecipients() == null || preview.getTotalRecipients() == 0) {
            throw new IllegalArgumentException("No eligible participants with AT holdings found for this trade");
        }

        MarketplaceTrade trade = marketplaceTradeRepository.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("Trade not found"));

        ProfitDistribution distribution = new ProfitDistribution();
        distribution.setHospitalId(trade.getHospitalId());
        distribution.setTotalProfit(preview.getTotalProfit());
        distribution.setPatientsPercentage(preview.getPatientSharePercent());
        distribution.setHospitalPercentage(preview.getHospitalSharePercent());
        distribution.setBankPercentage(preview.getBankSharePercent());
        distribution.setHospitalOperations(preview.getHospitalAmountPkr());
        distribution.setHospitalEarning(preview.getHospitalAmountPkr());
        distribution.setBankLoanFunds(nz(preview.getBankAmountPkr()));
        distribution.setTradeId(tradeId);
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

            creditAssetHealthCard(item.getPatientId(), item.getHtAmount());

            BlockchainTxRef chainTx = tokenContractGateway.mintHT(
                    item.getWalletAddress(),
                    TokenUnitConverter.toBaseUnits(nz(item.getHtAmount()), 18)
            );

            Transaction tx = new Transaction();
            tx.setUserId(item.getUserId());
            tx.setTokenId(htTokenId);
            tx.setType(Transaction.TransactionType.HT_MINT);
            tx.setAmount(nz(item.getHtAmount()));
            tx.setDescription("HT minted from trade profit distribution " + distribution.getProfitDistributionId());
            tx.setSenderWalletAddress("HOSPITAL-TREASURY");
            tx.setReceiverWalletAddress(item.getWalletAddress());
            tx.setTransactionHash(chainTx.getTransactionHash());
            tx.setBlockNumber(chainTx.getBlockNumber());
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

    @Transactional(readOnly = true)
    public boolean hasTradeProfitDistribution(UUID tradeId) {
        return tradeId != null && profitDistributionRepository.existsByTradeId(tradeId);
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
        User user = findHospitalUser(email);
        UUID hospitalId = requireHospitalId(user);

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

                    List<ProfitDistributionHistoryItemDto.RecipientDto> recipientDetails = allocations.stream()
                            .map(allocation -> {
                                String name = patientRepository.findById(allocation.getPatientId())
                                        .flatMap(p -> userRepository.findById(p.getUserId()))
                                        .map(User::getName)
                                        .orElse("Unknown Patient");
                                return new ProfitDistributionHistoryItemDto.RecipientDto(
                                        allocation.getPatientId(),
                                        name,
                                        nz(allocation.getAllocatedAmountHt()),
                                        nz(allocation.getAllocatedPercentage())
                                );
                            })
                            .toList();

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
                    dto.setRecipientDetails(recipientDetails);

                    if (distribution.getTradeId() != null) {
                        dto.setTradeId(distribution.getTradeId());
                        marketplaceTradeRepository.findById(distribution.getTradeId()).ifPresent(trade -> {
                            dto.setTradeTitle(trade.getTradeTitle());
                            dto.setTradeDescription(trade.getTradeDescription());
                            dto.setTradeType(trade.getTradeType() != null ? trade.getTradeType().name() : null);
                            dto.setTradeProfitLoss(trade.getProfitLoss());
                            dto.setTradeEndTime(trade.getEndTime());
                        });
                    }
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

    private List<PatientAllocationPreviewDto> buildTradeAllocations(UUID tradeId, BigDecimal totalHt, BigDecimal tokenMintPoolPkr) {
        List<TradeParticipation> participations = tradeParticipationRepository.findByTradeId(tradeId);
        if (participations.isEmpty()) {
            return List.of();
        }

        var patientIds = participations.stream().map(TradeParticipation::getPatientId).collect(Collectors.toSet());
        var patientsById = patientRepository.findAllById(patientIds).stream()
                .collect(Collectors.toMap(Patient::getId, p -> p));
        var userIds = patientsById.values().stream()
                .map(Patient::getUserId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        var usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getUserId, u -> u));

        List<TradeParticipantHolding> holdings = new ArrayList<>();
        for (TradeParticipation participation : participations) {
            Patient patient = patientsById.get(participation.getPatientId());
            if (patient == null) {
                continue;
            }
            String walletAddress = patient.getWalletAddress();
            if (walletAddress == null || walletAddress.isBlank()) {
                throw new IllegalArgumentException("Patient " + participation.getPatientId() + " does not have a wallet address");
            }
            BigDecimal contribution = nz(participation.getAtMonetaryValuePkr());
            if (contribution.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            User user = usersById.get(patient.getUserId());
            holdings.add(new TradeParticipantHolding(
                    participation.getPatientId(),
                    patient.getUserId(),
                    participation.getAssetId(),
                    user != null ? user.getName() : "Unknown Patient",
                    walletAddress,
                    contribution
            ));
        }

        BigDecimal totalContribution = holdings.stream()
                .map(TradeParticipantHolding::contributionPkr)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalContribution.compareTo(BigDecimal.ZERO) <= 0) {
            return List.of();
        }

        List<PatientAllocationPreviewDto> allocations = new ArrayList<>();
        BigDecimal allocatedShare = BigDecimal.ZERO;
        BigDecimal allocatedHt = BigDecimal.ZERO;
        BigDecimal allocatedPkrValue = BigDecimal.ZERO;

        for (int i = 0; i < holdings.size(); i++) {
            TradeParticipantHolding holding = holdings.get(i);
            boolean isLast = i == holdings.size() - 1;

            BigDecimal sharePercent;
            BigDecimal htAmount;
            BigDecimal pkrValue;

            if (isLast) {
                sharePercent = ONE_HUNDRED.subtract(allocatedShare);
                htAmount = totalHt.subtract(allocatedHt);
                pkrValue = tokenMintPoolPkr.subtract(allocatedPkrValue);
            } else {
                sharePercent = holding.contributionPkr()
                        .multiply(ONE_HUNDRED)
                        .divide(totalContribution, 8, RoundingMode.HALF_UP);
                htAmount = totalHt.multiply(holding.contributionPkr())
                        .divide(totalContribution, 8, RoundingMode.HALF_UP);
                pkrValue = tokenMintPoolPkr.multiply(holding.contributionPkr())
                        .divide(totalContribution, 8, RoundingMode.HALF_UP);

                allocatedShare = allocatedShare.add(sharePercent);
                allocatedHt = allocatedHt.add(htAmount);
                allocatedPkrValue = allocatedPkrValue.add(pkrValue);
            }

            PatientAllocationPreviewDto dto = new PatientAllocationPreviewDto();
            dto.setPatientId(holding.patientId());
            dto.setUserId(holding.userId());
            dto.setAssetId(holding.assetId());
            dto.setPatientName(holding.name());
            dto.setWalletAddress(holding.walletAddress());
            dto.setAssetContributionPkr(holding.contributionPkr());
            dto.setSharePercent(sharePercent.max(BigDecimal.ZERO));
            dto.setHtAmount(htAmount.max(BigDecimal.ZERO));
            dto.setPkrValue(pkrValue.max(BigDecimal.ZERO));
            allocations.add(dto);
        }

        return allocations;
    }

    private BigDecimal calculateAvailableTradeProfit(MarketplaceTrade trade) {
        BigDecimal profitLoss = nz(trade.getProfitLoss());
        return profitLoss.compareTo(BigDecimal.ZERO) > 0 ? profitLoss : BigDecimal.ZERO;
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

    private User findHospitalUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Role.RoleType role = user.getRole() != null ? user.getRole().getRoleName() : null;
        if (role != Role.RoleType.hospital_admin && role != Role.RoleType.hospital_staff) {
            throw new IllegalArgumentException("Only hospital admin or staff can view profit allocation history");
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

        private record TradeParticipantHolding(
            UUID patientId,
            UUID userId,
            UUID assetId,
            String name,
            String walletAddress,
            BigDecimal contributionPkr
        ) {}
}
