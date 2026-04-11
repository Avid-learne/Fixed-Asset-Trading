package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import com.SehatVault.SehatVaultBackend.bankintegration.entity.Partnership;
import com.SehatVault.SehatVaultBackend.bankintegration.repository.PartnershipRepository;
import com.SehatVault.SehatVaultBackend.healthcard.entity.Card;
import com.SehatVault.SehatVaultBackend.healthcard.entity.HealthCard;
import com.SehatVault.SehatVaultBackend.healthcard.repository.CardRepository;
import com.SehatVault.SehatVaultBackend.healthcard.repository.HealthCardRepository;
import com.SehatVault.SehatVaultBackend.marketplace.dto.CreateTradeRequest;
import com.SehatVault.SehatVaultBackend.marketplace.dto.ExecuteTradeRequest;
import com.SehatVault.SehatVaultBackend.marketplace.dto.HospitalAtPoolDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.OrderBookDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.OrderBookLevelDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.PatientTradeDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.TradeDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.UpdateTradeRequest;
import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitAllocation;
import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitDistribution;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.ProfitAllocationRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.ProfitDistributionRepository;
import com.SehatVault.SehatVaultBackend.blockchain.dto.BlockchainTradeRequest;
import com.SehatVault.SehatVaultBackend.blockchain.dto.BlockchainTradeResponse;
import com.SehatVault.SehatVaultBackend.blockchain.service.BlockchainService;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import com.SehatVault.SehatVaultBackend.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.math.RoundingMode;
import java.util.Random;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceService {

    private static final BigDecimal AT_TO_PKR = BigDecimal.TEN;
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final BigDecimal HT_CONVERSION_RATE = new BigDecimal("10");

    private final MarketplaceTradeRepository marketplaceTradeRepository;
    private final PatientRepository patientRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ProfitDistributionRepository profitDistributionRepository;
    private final ProfitAllocationRepository profitAllocationRepository;
    private final PartnershipRepository partnershipRepository;
    private final HealthCardRepository healthCardRepository;
    private final CardRepository cardRepository;
    private final HospitalAtPoolService hospitalAtPoolService;
    private final TradingSimulationService tradingSimulationService;
    private final AtTradingService atTradingService;
    private final BlockchainService blockchainService;

    public List<TradeDto> getTradesByHospital(UUID hospitalId) {
        return marketplaceTradeRepository.findByHospitalIdOrderByStartTimeDesc(hospitalId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<PatientTradeDto> getPatientViewTrades(UUID hospitalId) {
        return marketplaceTradeRepository.findByHospitalIdOrderByStartTimeDesc(hospitalId)
                .stream()
                .map(this::toPatientDto)
                .collect(Collectors.toList());
    }

    public HospitalAtPoolDto getHospitalAtPool(UUID hospitalId) {
        HospitalPoolSnapshot snapshot = buildHospitalPoolSnapshot(hospitalId);

        HospitalAtPoolDto dto = new HospitalAtPoolDto();
        dto.setHospitalId(hospitalId);
        dto.setPatientCount(snapshot.patientCount);
        dto.setOpenTrades(snapshot.openTrades);
        dto.setTotalAtPool(snapshot.totalAtPool);
        dto.setTotalAtPoolPkr(snapshot.totalAtPoolPkr);
        dto.setAllocatedPkr(snapshot.allocatedPkr);
        dto.setAvailablePkr(snapshot.availablePkr);
        dto.setAllocatedAt(toAt(snapshot.allocatedPkr));
        dto.setAvailableAt(toAt(snapshot.availablePkr));
        return dto;
    }

    @Transactional
    public TradeDto executeTrade(ExecuteTradeRequest request) {
        validateExecuteRequest(request);

        UUID hospitalId = request.getHospitalId();
        MarketplaceTrade.TradeType tradeType = parseTradeType(request.getTradeType());
        HospitalPoolSnapshot poolSnapshot = buildHospitalPoolSnapshot(hospitalId);

        BigDecimal openingPrice = nz(request.getOpeningPrice());
        BigDecimal quantity = nz(request.getQuantity());
        BigDecimal amountInvested = nz(request.getAmountInvested());

        if (amountInvested.compareTo(BigDecimal.ZERO) <= 0) {
            amountInvested = openingPrice.multiply(quantity);
        }
        if (amountInvested.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("amountInvested must be greater than zero");
        }

        if (openingPrice.compareTo(BigDecimal.ZERO) <= 0 || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            openingPrice = BigDecimal.ONE;
            quantity = amountInvested;
        }

        if (amountInvested.compareTo(poolSnapshot.availablePkr) > 0) {
            throw new IllegalArgumentException("Insufficient hospital AT pool. Available: "
                    + toAt(poolSnapshot.availablePkr).toPlainString()
                    + " AT, required: "
                    + toAt(amountInvested).toPlainString()
                    + " AT");
        }

        BigDecimal totalAtBurned = nz(request.getTotalAtBurned());
        if (totalAtBurned.compareTo(BigDecimal.ZERO) <= 0) {
            totalAtBurned = toAt(amountInvested);
        }

        List<HospitalAtPoolService.PoolBurnAllocationResult> burnResults = hospitalAtPoolService
                .applyBurnAllocations(hospitalId, totalAtBurned);

        TradingSimulationService.SimulationResult simulation = tradingSimulationService
                .simulate(openingPrice, quantity, tradeType);

        MarketplaceTrade trade = new MarketplaceTrade();
        trade.setHospitalId(hospitalId);
        trade.setTradeType(tradeType);
        trade.setTradeTitle(resolveAssetName(request.getAssetName(), request.getTitle()));
        trade.setTradeDescription(sanitize(request.getDescription()));
        trade.setInvestmentDescription(buildDescription(
                sanitize(request.getAssetType()).isEmpty() ? request.getInvestment() : request.getAssetType(),
                request.getLocation(),
                request.getNotes()));

        trade.setStartTime(simulation.startTime());
        trade.setEndTime(simulation.endTime());
        trade.setStatus(MarketplaceTrade.TradeStatus.CLOSED);

        trade.setOpeningPrice(simulation.openingPrice());
        trade.setClosingPrice(simulation.closingPrice());
        trade.setHigh(simulation.high());
        trade.setLow(simulation.low());
        trade.setVolume(simulation.volume());

        trade.setAmountInvested(amountInvested);
        trade.setAmountBeforeTrade(amountInvested);

        BigDecimal pnl = simulation.profitLoss();
        BigDecimal amountAfterTrade = amountInvested.add(pnl);
        if (amountAfterTrade.compareTo(BigDecimal.ZERO) < 0) {
            amountAfterTrade = BigDecimal.ZERO;
            pnl = amountAfterTrade.subtract(amountInvested);
        }

        trade.setAmountAfterTrade(amountAfterTrade);
        trade.setProfitLoss(pnl);
        trade.setTotalAtBurnt(totalAtBurned);

        MarketplaceTrade savedTrade = marketplaceTradeRepository.save(trade);

        BlockchainTradeResponse blockchainTrade = blockchainService.recordTrade(
            BlockchainTradeRequest.builder()
                .investedAT(totalAtBurned.toBigInteger())
                .profitEarned(pnl.max(BigDecimal.ZERO).toBigInteger())
                .build());

        applyPatientAtBurnDeductions(savedTrade, burnResults, simulation, blockchainTrade);
        applyProfitDistribution(savedTrade, burnResults, request, simulation, blockchainTrade);

        return toDto(savedTrade);
    }

    public OrderBookDto getOrderBook(UUID hospitalId, String investment) {
        String targetInvestment = investment == null ? "" : investment.trim();

        List<MarketplaceTrade> activeTrades = marketplaceTradeRepository
                .findByHospitalIdAndStatusOrderByOpeningPriceDesc(hospitalId, MarketplaceTrade.TradeStatus.ACTIVE);

        Map<BigDecimal, BigDecimal> bidVolumes = new TreeMap<>(Comparator.reverseOrder());
        Map<BigDecimal, BigDecimal> askVolumes = new TreeMap<>();

        for (MarketplaceTrade trade : activeTrades) {
            DescriptionParts parts = parseDescription(trade.getInvestmentDescription());
            if (!targetInvestment.isEmpty() && !parts.investment.equalsIgnoreCase(targetInvestment)) {
                continue;
            }

            BigDecimal price = nz(trade.getOpeningPrice());
            BigDecimal volume = nz(trade.getVolume());
            if (price.compareTo(BigDecimal.ZERO) <= 0 || volume.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            if (trade.getTradeType() == MarketplaceTrade.TradeType.BUY) {
                bidVolumes.merge(price, volume, BigDecimal::add);
            } else if (trade.getTradeType() == MarketplaceTrade.TradeType.SELL) {
                askVolumes.merge(price, volume, BigDecimal::add);
            }
        }

        List<OrderBookLevelDto> bids = toOrderBookLevels(bidVolumes, "BID", 8);
        List<OrderBookLevelDto> asks = toOrderBookLevels(askVolumes, "ASK", 8);

        BigDecimal spread = BigDecimal.ZERO;
        if (!bids.isEmpty() && !asks.isEmpty()) {
            spread = asks.get(0).getPrice().subtract(bids.get(0).getPrice());
        }

        OrderBookDto dto = new OrderBookDto();
        dto.setBids(bids);
        dto.setAsks(asks);
        dto.setSpread(spread);
        return dto;
    }

    @Transactional
    public TradeDto createTrade(CreateTradeRequest request) {
        validateCreateRequest(request);
        log.info("[Marketplace] createTrade request hospitalId={} type={} title='{}' investment='{}'",
                request.getHospitalId(), request.getTradeType(), request.getTitle(), request.getInvestment());

        MarketplaceTrade trade = new MarketplaceTrade();
        trade.setHospitalId(request.getHospitalId());
        trade.setTradeType(parseTradeType(request.getTradeType()));
        trade.setStatus(MarketplaceTrade.TradeStatus.ACTIVE);
        LocalDate tradeDate = request.getTradeDate();
        trade.setStartTime((tradeDate == null ? LocalDate.now() : tradeDate).atStartOfDay());

        BigDecimal buyPrice = request.getBuyPrice() != null ? request.getBuyPrice() : request.getOpeningPrice();
        BigDecimal quantity = request.getQuantity();
        BigDecimal currentValuePerUnit = request.getCurrentValue();

        trade.setOpeningPrice(nz(buyPrice));
        trade.setVolume(nz(quantity));
        trade.setHigh(request.getHigh() != null ? request.getHigh() : nz(buyPrice));
        trade.setLow(request.getLow() != null ? request.getLow() : nz(buyPrice));
        BigDecimal closingPricePerUnit = currentValuePerUnit != null
                ? currentValuePerUnit
                : request.getClosingPrice() != null ? request.getClosingPrice() : nz(buyPrice);
        trade.setClosingPrice(closingPricePerUnit);
        trade.setAmountBeforeTrade(BigDecimal.ZERO);

        BigDecimal amountInvested = trade.getOpeningPrice().multiply(trade.getVolume());
        HospitalPoolSnapshot poolSnapshot = buildHospitalPoolSnapshot(request.getHospitalId());
        if (amountInvested.compareTo(poolSnapshot.availablePkr) > 0) {
            throw new IllegalArgumentException("Insufficient hospital AT pool. Available: "
                    + toAt(poolSnapshot.availablePkr).toPlainString()
                    + " AT, required: "
                    + toAt(amountInvested).toPlainString()
                    + " AT");
        }

        BigDecimal amountAfterTrade = trade.getClosingPrice().multiply(trade.getVolume());
        BigDecimal profitLoss = amountAfterTrade.subtract(amountInvested);

        trade.setAmountInvested(amountInvested);
        trade.setAmountAfterTrade(amountAfterTrade);
        trade.setProfitLoss(profitLoss);
        trade.setTotalAtBurnt(BigDecimal.ZERO);

        String assetName = sanitize(request.getAssetName());
        if (assetName.isEmpty()) {
            assetName = sanitize(request.getTitle());
        }
        String tradeDescription = sanitize(request.getDescription());

        trade.setTradeTitle(assetName);
        trade.setTradeDescription(tradeDescription);

        trade.setInvestmentDescription(buildDescription(
                sanitize(request.getAssetType()).isEmpty() ? request.getInvestment() : request.getAssetType(),
                request.getLocation(),
                request.getNotes()));

        MarketplaceTrade saved = marketplaceTradeRepository.save(trade);
        log.info("[Marketplace] createTrade saved tradeId={} tradeTitle='{}' tradeDescription='{}'",
                saved.getTradeId(), saved.getTradeTitle(), saved.getTradeDescription());
        return toDto(saved);
    }

    @Transactional
    public TradeDto updateTrade(UUID tradeId, UpdateTradeRequest request) {
        log.info("[Marketplace] updateTrade request tradeId={} title='{}' status={}",
                tradeId, request.getTitle(), request.getStatus());
        MarketplaceTrade trade = marketplaceTradeRepository.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("Trade not found"));
        MarketplaceTrade.TradeStatus previousStatus = trade.getStatus();

        if (request.getTradeType() != null && !request.getTradeType().isBlank()) {
            trade.setTradeType(parseTradeType(request.getTradeType()));
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            MarketplaceTrade.TradeStatus status = parseTradeStatus(request.getStatus());
            trade.setStatus(status);
            if (status == MarketplaceTrade.TradeStatus.CLOSED && trade.getEndTime() == null) {
                trade.setEndTime(LocalDateTime.now());
            }
        }

        BigDecimal updatedBuyPrice = request.getBuyPrice() != null ? request.getBuyPrice() : request.getOpeningPrice();
        if (updatedBuyPrice != null) {
            trade.setOpeningPrice(updatedBuyPrice);
        }
        if (request.getHigh() != null) {
            trade.setHigh(request.getHigh());
        }
        if (request.getLow() != null) {
            trade.setLow(request.getLow());
        }
        if (request.getClosingPrice() != null) {
            trade.setClosingPrice(request.getClosingPrice());
        }
        BigDecimal updatedQuantity = request.getQuantity();
        if (updatedQuantity != null) {
            trade.setVolume(updatedQuantity);
        }
        if (request.getTradeDate() != null) {
            trade.setStartTime(request.getTradeDate().atStartOfDay());
        }

        DescriptionParts parts = parseDescription(trade.getInvestmentDescription());
        String title = request.getAssetName() != null ? sanitize(request.getAssetName())
                : request.getTitle() != null ? sanitize(request.getTitle())
                        : sanitize(trade.getTradeTitle());
        String description = request.getDescription() != null ? sanitize(request.getDescription())
                : sanitize(trade.getTradeDescription());
        String investment = request.getAssetType() != null ? request.getAssetType()
                : request.getInvestment() != null ? request.getInvestment()
                        : parts.investment;
        String location = request.getLocation() != null ? request.getLocation() : parts.location;
        String notes = request.getNotes() != null ? request.getNotes() : parts.notes;
        trade.setTradeTitle(title);
        trade.setTradeDescription(description);
        trade.setInvestmentDescription(buildDescription(investment, location, notes));

        // Recompute derived financial fields after edits.
        BigDecimal quantity = nz(trade.getVolume());
        BigDecimal amountInvested = nz(trade.getOpeningPrice()).multiply(quantity);
        BigDecimal amountAfterTrade;
        if (trade.getStatus() == MarketplaceTrade.TradeStatus.CLOSED) {
            BigDecimal exitPerUnit = request.getExitValue() != null
                    ? request.getExitValue()
                    : request.getCurrentValue() != null
                            ? request.getCurrentValue()
                            : nz(trade.getClosingPrice());
            trade.setClosingPrice(exitPerUnit);
            amountAfterTrade = nz(exitPerUnit).multiply(quantity);
        } else {
            if (request.getCurrentValue() != null) {
                trade.setClosingPrice(request.getCurrentValue());
            }
            amountAfterTrade = nz(trade.getClosingPrice()).multiply(quantity);
            if (amountAfterTrade.compareTo(BigDecimal.ZERO) <= 0) {
                amountAfterTrade = amountInvested;
            }
        }
        BigDecimal profitLoss = amountAfterTrade.subtract(amountInvested);

        trade.setAmountInvested(amountInvested);
        trade.setAmountAfterTrade(amountAfterTrade);
        trade.setProfitLoss(profitLoss);

        boolean closingNow = previousStatus != MarketplaceTrade.TradeStatus.CLOSED
                && trade.getStatus() == MarketplaceTrade.TradeStatus.CLOSED;
        if (closingNow) {
            settleClosedTrade(
                    trade,
                    buildDistributionRequestForClose(trade.getHospitalId()),
                    buildManualSettlementMetadata("UPD-" + trade.getTradeId()));
        }

        MarketplaceTrade saved = marketplaceTradeRepository.save(trade);
        log.info("[Marketplace] updateTrade saved tradeId={} tradeTitle='{}' tradeDescription='{}'",
                saved.getTradeId(), saved.getTradeTitle(), saved.getTradeDescription());
        return toDto(saved);
    }

    @Transactional
    public TradeDto closeTrade(UUID tradeId) {
        return closeTrade(tradeId, null);
    }

    @Transactional
    public TradeDto closeTrade(UUID tradeId, UpdateTradeRequest request) {
        MarketplaceTrade trade = marketplaceTradeRepository.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("Trade not found"));

        if (trade.getStatus() == MarketplaceTrade.TradeStatus.CLOSED) {
            return toDto(trade);
        }

        BigDecimal quantity = nz(trade.getVolume());
        BigDecimal amountInvested = nz(trade.getOpeningPrice()).multiply(quantity);

        BigDecimal exitPerUnit = request != null && request.getExitValue() != null
                ? request.getExitValue()
                : request != null && request.getCurrentValue() != null
                        ? request.getCurrentValue()
                        : nz(trade.getClosingPrice());
        if (exitPerUnit.compareTo(BigDecimal.ZERO) <= 0) {
            exitPerUnit = nz(trade.getOpeningPrice());
        }

        BigDecimal amountAfterTrade = exitPerUnit.multiply(quantity);
        BigDecimal pnl = amountAfterTrade.subtract(amountInvested);

        trade.setStatus(MarketplaceTrade.TradeStatus.CLOSED);
        trade.setEndTime(LocalDateTime.now());
        trade.setClosingPrice(exitPerUnit);
        trade.setAmountInvested(amountInvested);
        trade.setAmountBeforeTrade(amountInvested);
        trade.setAmountAfterTrade(amountAfterTrade);
        trade.setProfitLoss(pnl);

        settleClosedTrade(
                trade,
                buildDistributionRequestForClose(trade.getHospitalId()),
                buildManualSettlementMetadata("CLS-" + trade.getTradeId()));

        MarketplaceTrade saved = marketplaceTradeRepository.save(trade);
        return toDto(saved);
    }

    private void validateCreateRequest(CreateTradeRequest request) {
        if (request.getHospitalId() == null) {
            throw new IllegalArgumentException("hospitalId is required");
        }
        if (request.getTradeType() == null || request.getTradeType().isBlank()) {
            throw new IllegalArgumentException("tradeType is required");
        }
        String assetName = sanitize(request.getAssetName()).isEmpty() ? sanitize(request.getTitle())
                : sanitize(request.getAssetName());
        if (assetName.isEmpty()) {
            throw new IllegalArgumentException("assetName is required");
        }
        BigDecimal buyPrice = request.getBuyPrice() != null ? request.getBuyPrice() : request.getOpeningPrice();
        BigDecimal quantity = request.getQuantity();
        if (buyPrice == null || buyPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("buyPrice must be greater than zero");
        }
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("quantity must be greater than zero");
        }
    }

    private void validateExecuteRequest(ExecuteTradeRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getHospitalId() == null) {
            throw new IllegalArgumentException("hospitalId is required");
        }
        if (request.getTradeType() == null || request.getTradeType().isBlank()) {
            throw new IllegalArgumentException("tradeType is required");
        }
        String assetName = resolveAssetName(request.getAssetName(), request.getTitle());
        if (assetName.isBlank()) {
            throw new IllegalArgumentException("assetName is required");
        }
    }

    private TradeDto toDto(MarketplaceTrade trade) {
        DescriptionParts parts = parseDescription(trade.getInvestmentDescription());
        String resolvedTitle = sanitize(trade.getTradeTitle()).isEmpty() ? parts.investment
                : sanitize(trade.getTradeTitle());
        String resolvedDescription = sanitize(trade.getTradeDescription());
        if (resolvedDescription.isEmpty()) {
            resolvedDescription = parts.notes;
        }

        TradeDto dto = new TradeDto();
        dto.setTradeId(trade.getTradeId());
        dto.setHospitalId(trade.getHospitalId());
        dto.setTradeType(trade.getTradeType().name());
        dto.setStatus(mapStatusForFrontend(trade.getStatus()));

        dto.setTitle(resolvedTitle);
        dto.setDescription(resolvedDescription);
        dto.setAssetName(resolvedTitle);
        dto.setAssetType(parts.investment);
        dto.setBuyPrice(nz(trade.getOpeningPrice()));
        dto.setQuantity(nz(trade.getVolume()));
        dto.setTradeDate(trade.getStartTime() == null ? null : trade.getStartTime().toLocalDate());
        dto.setCurrentValue(nz(trade.getClosingPrice()));
        if (trade.getStatus() == MarketplaceTrade.TradeStatus.CLOSED) {
            dto.setExitValue(nz(trade.getClosingPrice()));
            dto.setRealizedPnl(nz(trade.getProfitLoss()));
            dto.setUnrealizedPnl(BigDecimal.ZERO);
        } else {
            dto.setExitValue(null);
            dto.setRealizedPnl(BigDecimal.ZERO);
            dto.setUnrealizedPnl(nz(trade.getProfitLoss()));
        }
        dto.setInvestment(parts.investment);
        dto.setLocation(parts.location);
        dto.setNotes(parts.notes);

        dto.setAmountInvested(trade.getAmountInvested());
        dto.setAmountBeforeTrade(trade.getAmountBeforeTrade());
        dto.setAmountAfterTrade(trade.getAmountAfterTrade());
        dto.setProfitLoss(trade.getProfitLoss());
        dto.setTotalAtBurnt(trade.getTotalAtBurnt());

        dto.setOpeningPrice(trade.getOpeningPrice());
        dto.setHigh(trade.getHigh());
        dto.setLow(trade.getLow());
        dto.setClosingPrice(trade.getClosingPrice());
        dto.setVolume(trade.getVolume());

        dto.setStartTime(trade.getStartTime());
        dto.setEndTime(trade.getEndTime());
        dto.setCreatedAt(trade.getCreatedAt());
        dto.setUpdatedAt(trade.getUpdatedAt());
        return dto;
    }

    private PatientTradeDto toPatientDto(MarketplaceTrade trade) {
        DescriptionParts parts = parseDescription(trade.getInvestmentDescription());
        String name = sanitize(trade.getTradeTitle()).isEmpty() ? parts.investment : sanitize(trade.getTradeTitle());

        PatientTradeDto dto = new PatientTradeDto();
        dto.setTradeId(trade.getTradeId());
        dto.setTradeName(name);
        dto.setAssetType(parts.investment);
        dto.setInvestmentAmount(nz(trade.getAmountInvested()));
        dto.setCurrentValue(nz(trade.getAmountAfterTrade()));
        dto.setPnl(nz(trade.getProfitLoss()));
        return dto;
    }

    private String mapStatusForFrontend(MarketplaceTrade.TradeStatus status) {
        if (status == null) {
            return "OPEN";
        }
        return switch (status) {
            case ACTIVE -> "OPEN";
            case CLOSED -> "CLOSED";
            case CANCELLED -> "CANCELLED";
        };
    }

    private MarketplaceTrade.TradeType parseTradeType(String value) {
        return MarketplaceTrade.TradeType.valueOf(value.trim().toUpperCase());
    }

    private MarketplaceTrade.TradeStatus parseTradeStatus(String value) {
        String normalized = value.trim().toUpperCase();
        if ("OPEN".equals(normalized)) {
            return MarketplaceTrade.TradeStatus.ACTIVE;
        }
        return MarketplaceTrade.TradeStatus.valueOf(normalized);
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private BigDecimal toAt(BigDecimal pkr) {
        return nz(pkr).divide(AT_TO_PKR, 2, RoundingMode.HALF_UP);
    }

    private HospitalPoolSnapshot buildHospitalPoolSnapshot(UUID hospitalId) {
        List<Patient> patients = patientRepository.findByHospitalId(hospitalId);
        BigDecimal totalAtPool = hospitalAtPoolService.getTotalAvailableAt(hospitalId);
        Set<UUID> pooledPatients = new HashSet<>();
        hospitalAtPoolService.getActivePoolEntries(hospitalId).forEach(item -> pooledPatients.add(item.getPatientId()));

        List<MarketplaceTrade> activeTrades = marketplaceTradeRepository
                .findByHospitalIdAndStatusOrderByOpeningPriceDesc(hospitalId, MarketplaceTrade.TradeStatus.ACTIVE);

        BigDecimal allocatedPkr = activeTrades.stream()
                .map(MarketplaceTrade::getAmountInvested)
                .map(this::nz)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAtPoolPkr = totalAtPool.multiply(AT_TO_PKR);
        BigDecimal availablePkr = totalAtPoolPkr.subtract(allocatedPkr);
        if (availablePkr.compareTo(BigDecimal.ZERO) < 0) {
            availablePkr = BigDecimal.ZERO;
        }

        return new HospitalPoolSnapshot(
                pooledPatients.isEmpty() ? patients.size() : pooledPatients.size(),
                activeTrades.size(),
                totalAtPool,
                totalAtPoolPkr,
                allocatedPkr,
                availablePkr);
    }

    private List<OrderBookLevelDto> toOrderBookLevels(Map<BigDecimal, BigDecimal> side, String type, int maxLevels) {
        List<OrderBookLevelDto> levels = new ArrayList<>();
        int count = 0;
        for (Map.Entry<BigDecimal, BigDecimal> entry : side.entrySet()) {
            if (count >= maxLevels) {
                break;
            }
            OrderBookLevelDto level = new OrderBookLevelDto();
            level.setPrice(entry.getKey());
            level.setVolume(entry.getValue());
            level.setTotal(entry.getKey().multiply(entry.getValue()));
            level.setType(type);
            levels.add(level);
            count++;
        }
        return levels;
    }

    private String buildDescription(String investment, String location, String notes) {
        String inv = sanitize(investment);
        String loc = sanitize(location);
        String n = sanitize(notes);
        return "INV=" + inv + "\nLOC=" + loc + "\nNOTES=" + n;
    }

    private String sanitize(String value) {
        return value == null ? "" : value.replace("\n", " ").trim();
    }

    private String resolveAssetName(String assetName, String fallbackTitle) {
        String resolved = sanitize(assetName);
        if (resolved.isEmpty()) {
            resolved = sanitize(fallbackTitle);
        }
        return resolved;
    }

    private void settleClosedTrade(
            MarketplaceTrade trade,
            ExecuteTradeRequest distributionRequest,
            TradingSimulationService.SimulationResult settlementMetadata) {
        BigDecimal amountInvested = nz(trade.getAmountInvested());
        if (amountInvested.compareTo(BigDecimal.ZERO) <= 0) {
            amountInvested = nz(trade.getOpeningPrice()).multiply(nz(trade.getVolume()));
            trade.setAmountInvested(amountInvested);
        }

        BigDecimal totalAtBurned = nz(trade.getTotalAtBurnt());
        if (totalAtBurned.compareTo(BigDecimal.ZERO) <= 0) {
            totalAtBurned = toAt(amountInvested);
        }

        List<HospitalAtPoolService.PoolBurnAllocationResult> burnResults = hospitalAtPoolService
                .applyBurnAllocations(trade.getHospitalId(), totalAtBurned);
        trade.setTotalAtBurnt(totalAtBurned);

        BlockchainTradeResponse blockchainTrade = blockchainService.recordTrade(
            BlockchainTradeRequest.builder()
                .investedAT(totalAtBurned.toBigInteger())
                .profitEarned(nz(trade.getProfitLoss()).max(BigDecimal.ZERO).toBigInteger())
                .build());

        applyPatientAtBurnDeductions(trade, burnResults, settlementMetadata, blockchainTrade);
        applyProfitDistribution(trade, burnResults, distributionRequest, settlementMetadata, blockchainTrade);

        // NEW: Settle AT trading participations if any exist for this trade
        try {
            BigDecimal profitLoss = nz(trade.getProfitLoss());
            atTradingService.settleTrade(trade.getTradeId(), profitLoss);
            log.info("AT trading settlement completed for trade {}", trade.getTradeId());
        } catch (Exception e) {
            log.warn("AT settlement optional - trade {} may not have AT participations: {}",
                    trade.getTradeId(), e.getMessage());
        }
    }

    private TradingSimulationService.SimulationResult buildManualSettlementMetadata(String hashPrefix) {
        LocalDateTime now = LocalDateTime.now();
        return new TradingSimulationService.SimulationResult(
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                now.minusMinutes(1),
                now,
                Math.abs(new Random().nextLong(9_000_000L)) + 1_000_000L,
                hashPrefix + "-" + UUID.randomUUID().toString().replace("-", ""));
    }

    private ExecuteTradeRequest buildDistributionRequestForClose(UUID hospitalId) {
        ExecuteTradeRequest request = new ExecuteTradeRequest();
        request.setHospitalId(hospitalId);
        return request;
    }

    private void applyPatientAtBurnDeductions(
            MarketplaceTrade trade,
            List<HospitalAtPoolService.PoolBurnAllocationResult> burnResults,
            TradingSimulationService.SimulationResult simulation,
            BlockchainTradeResponse blockchainTrade) {
        if (burnResults.isEmpty()) {
            return;
        }

        UUID atTokenId = walletTransactionRepository.findTokenIdBySymbol("AT");
        if (atTokenId == null) {
            throw new IllegalArgumentException("AT token is not configured in tokens table");
        }

        for (HospitalAtPoolService.PoolBurnAllocationResult burn : burnResults) {
            Patient patient = patientRepository.findById(burn.patientId())
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found for burn allocation"));

            PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                    .orElseGet(() -> {
                        PatientTokenBalance created = new PatientTokenBalance();
                        created.setPatientId(patient.getId());
                        created.setTotalAt(BigDecimal.ZERO);
                        created.setTotalHt(BigDecimal.ZERO);
                        created.setLastUpdated(LocalDateTime.now());
                        return created;
                    });

            BigDecimal updatedAt = nz(balance.getTotalAt()).subtract(nz(burn.burnedAt()));
            if (updatedAt.compareTo(BigDecimal.ZERO) < 0) {
                updatedAt = BigDecimal.ZERO;
            }
            balance.setTotalAt(updatedAt);
            balance.setLastUpdated(LocalDateTime.now());
            patientTokenBalanceRepository.save(balance);

            Transaction tx = new Transaction();
            tx.setUserId(patient.getUserId());
            tx.setTokenId(atTokenId);
            tx.setType(Transaction.TransactionType.AT_BURN);
            tx.setAmount(burn.burnedAt());
            tx.setDescription("AT burn for trade " + trade.getTradeId() + " (asset " + burn.assetId() + ")");
            tx.setSenderWalletAddress(patient.getWalletAddress());
            tx.setReceiverWalletAddress("HOSPITAL-POOL");
            tx.setBlockNumber(simulation.blockNumber());
                tx.setTransactionHash(blockchainService.burnAssetToken(
                    patient.getWalletAddress(),
                    nz(burn.burnedAt()).toBigInteger(),
                    "TRADE_BURN_" + trade.getTradeId()));
                tx.setStatus(blockchainTrade != null && blockchainTrade.getStatus() != null
                    ? blockchainTrade.getStatus()
                    : "PENDING");
            tx.setTimestamp(LocalDateTime.now());
            walletTransactionRepository.save(tx);
        }
    }

    private void applyProfitDistribution(
            MarketplaceTrade trade,
            List<HospitalAtPoolService.PoolBurnAllocationResult> burnResults,
            ExecuteTradeRequest request,
            TradingSimulationService.SimulationResult simulation,
            BlockchainTradeResponse blockchainTrade) {
        BigDecimal totalProfit = nz(trade.getProfitLoss());
        if (totalProfit.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal patientsPercentage = request.getPatientsPercentage() == null
                ? new BigDecimal("60")
                : request.getPatientsPercentage();
        BigDecimal hospitalOperationsPercentage = request.getHospitalOperationsPercentage() == null
                ? new BigDecimal("20")
                : request.getHospitalOperationsPercentage();
        BigDecimal bankLoanPercentage = request.getBankLoanPercentage() == null
                ? new BigDecimal("10")
                : request.getBankLoanPercentage();

        BigDecimal totalPercentage = nz(patientsPercentage)
                .add(nz(hospitalOperationsPercentage))
                .add(nz(bankLoanPercentage));
        if (totalPercentage.compareTo(ONE_HUNDRED) > 0) {
            throw new IllegalArgumentException(
                    "patientsPercentage + hospitalOperationsPercentage + bankLoanPercentage cannot exceed 100");
        }

        BigDecimal patientSharePkr = totalProfit
                .multiply(patientsPercentage)
                .divide(ONE_HUNDRED, 8, RoundingMode.HALF_UP);
        BigDecimal hospitalOperationsPkr = totalProfit
                .multiply(hospitalOperationsPercentage)
                .divide(ONE_HUNDRED, 8, RoundingMode.HALF_UP);
        BigDecimal bankLoanFunds = totalProfit
                .multiply(bankLoanPercentage)
                .divide(ONE_HUNDRED, 8, RoundingMode.HALF_UP);

        BigDecimal hospitalEarning = totalProfit
                .subtract(patientSharePkr)
                .subtract(hospitalOperationsPkr)
                .subtract(bankLoanFunds);
        if (hospitalEarning.compareTo(BigDecimal.ZERO) < 0) {
            hospitalEarning = BigDecimal.ZERO;
        }

        ProfitDistribution distribution = new ProfitDistribution();
        distribution.setHospitalId(trade.getHospitalId());
        distribution.setTotalProfit(totalProfit);
        distribution.setPatientsPercentage(patientsPercentage);
        distribution.setHospitalOperations(hospitalOperationsPkr);
        distribution.setHospitalEarning(hospitalEarning);
        distribution.setBankLoanFunds(bankLoanFunds);
        distribution.setCreatedAt(LocalDateTime.now());
        distribution = profitDistributionRepository.save(distribution);

        if (patientSharePkr.compareTo(BigDecimal.ZERO) > 0 && !burnResults.isEmpty()) {
            allocateProfitToPatients(trade, distribution, burnResults, patientSharePkr, simulation, blockchainTrade);
        }

        applyBankLoanFundsToPartnership(trade.getHospitalId(), bankLoanFunds);
    }

    private void allocateProfitToPatients(
            MarketplaceTrade trade,
            ProfitDistribution distribution,
            List<HospitalAtPoolService.PoolBurnAllocationResult> burnResults,
            BigDecimal patientSharePkr,
            TradingSimulationService.SimulationResult simulation,
            BlockchainTradeResponse blockchainTrade) {
        BigDecimal totalBurnedAt = burnResults.stream()
                .map(HospitalAtPoolService.PoolBurnAllocationResult::burnedAt)
                .map(this::nz)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBurnedAt.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        UUID htTokenId = walletTransactionRepository.findTokenIdBySymbol("HT");
        if (htTokenId == null) {
            throw new IllegalArgumentException("HT token is not configured in tokens table");
        }

        BigDecimal allocatedPkrRunning = BigDecimal.ZERO;
        BigDecimal allocatedHtRunning = BigDecimal.ZERO;

        for (int i = 0; i < burnResults.size(); i++) {
            HospitalAtPoolService.PoolBurnAllocationResult burn = burnResults.get(i);
            boolean isLast = i == burnResults.size() - 1;

            BigDecimal sharePercent;
            BigDecimal pkrShare;
            BigDecimal htShare;

            if (isLast) {
                sharePercent = ONE_HUNDRED.subtract(burnResults.subList(0, i).stream()
                        .map(item -> nz(item.burnedAt())
                                .multiply(ONE_HUNDRED)
                                .divide(totalBurnedAt, 8, RoundingMode.HALF_UP))
                        .reduce(BigDecimal.ZERO, BigDecimal::add));
                pkrShare = patientSharePkr.subtract(allocatedPkrRunning);
                htShare = patientSharePkr.divide(HT_CONVERSION_RATE, 8, RoundingMode.HALF_UP)
                        .subtract(allocatedHtRunning);
            } else {
                sharePercent = nz(burn.burnedAt())
                        .multiply(ONE_HUNDRED)
                        .divide(totalBurnedAt, 8, RoundingMode.HALF_UP);
                pkrShare = patientSharePkr
                        .multiply(nz(burn.burnedAt()))
                        .divide(totalBurnedAt, 8, RoundingMode.HALF_UP);
                htShare = pkrShare.divide(HT_CONVERSION_RATE, 8, RoundingMode.HALF_UP);

                allocatedPkrRunning = allocatedPkrRunning.add(pkrShare);
                allocatedHtRunning = allocatedHtRunning.add(htShare);
            }

            ProfitAllocation allocation = new ProfitAllocation();
            allocation.setProfitDistributionId(distribution.getProfitDistributionId());
            allocation.setPatientId(burn.patientId());
            allocation.setAssetId(burn.assetId());
            allocation.setAllocatedPercentage(sharePercent.max(BigDecimal.ZERO));
            allocation.setAllocatedAmountHt(htShare.max(BigDecimal.ZERO));
            allocation.setTimestamp(LocalDateTime.now());
            profitAllocationRepository.save(allocation);

            Patient patient = patientRepository.findById(burn.patientId())
                    .orElseThrow(() -> new IllegalArgumentException("Patient not found for profit allocation"));

            PatientTokenBalance balance = patientTokenBalanceRepository.findByPatientId(patient.getId())
                    .orElseGet(() -> {
                        PatientTokenBalance created = new PatientTokenBalance();
                        created.setPatientId(patient.getId());
                        created.setTotalAt(BigDecimal.ZERO);
                        created.setTotalHt(BigDecimal.ZERO);
                        created.setLastUpdated(LocalDateTime.now());
                        return created;
                    });
            balance.setTotalHt(nz(balance.getTotalHt()).add(htShare.max(BigDecimal.ZERO)));
            balance.setLastUpdated(LocalDateTime.now());
            patientTokenBalanceRepository.save(balance);

            creditAssetHealthCard(patient.getId(), htShare.max(BigDecimal.ZERO));

            Transaction tx = new Transaction();
            tx.setUserId(patient.getUserId());
            tx.setTokenId(htTokenId);
            tx.setType(Transaction.TransactionType.HT_MINT);
            tx.setAmount(htShare.max(BigDecimal.ZERO));
            tx.setDescription("HT minted from trade profit " + trade.getTradeId() + " (asset " + burn.assetId() + ")");
            tx.setSenderWalletAddress("HOSPITAL-TREASURY");
            tx.setReceiverWalletAddress(patient.getWalletAddress());
            tx.setBlockNumber(simulation.blockNumber());
                tx.setTransactionHash(blockchainService
                    .mintHealthToken(
                        patient.getWalletAddress(),
                        htShare.max(BigDecimal.ZERO).toBigInteger(),
                        trade.getTradeId().toString())
                    .getTransactionHash());
                tx.setStatus(blockchainTrade != null && blockchainTrade.getStatus() != null
                    ? blockchainTrade.getStatus()
                    : "PENDING");
            tx.setTimestamp(LocalDateTime.now());
            walletTransactionRepository.save(tx);
        }
    }

    private void applyBankLoanFundsToPartnership(UUID hospitalId, BigDecimal bankLoanFunds) {
        if (bankLoanFunds == null || bankLoanFunds.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        partnershipRepository
                .findFirstByHospitalIdAndIntegrationStatusOrderByCreatedAtDesc(
                        hospitalId,
                        Partnership.IntegrationStatus.APPROVED)
                .ifPresent(partnership -> {
                    BigDecimal outstanding = nz(partnership.getLoansTakenByHospital()).subtract(bankLoanFunds);
                    if (outstanding.compareTo(BigDecimal.ZERO) < 0) {
                        outstanding = BigDecimal.ZERO;
                    }

                    partnership.setLoansTakenByHospital(outstanding);
                    partnership.setTotalDeposits(nz(partnership.getTotalDeposits()).add(bankLoanFunds));
                    partnershipRepository.save(partnership);
                });
    }

    private void creditAssetHealthCard(UUID patientId, BigDecimal htCredit) {
        if (htCredit == null || htCredit.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        Card card = cardRepository.findByCardNameIgnoreCase("Asset Health Card").orElseGet(() -> {
            Card created = new Card();
            created.setCardName("Asset Health Card");
            return cardRepository.save(created);
        });

        List<HealthCard> cards = healthCardRepository.findByPatientIdAndCardId(patientId, card.getCardId());
        HealthCard target;
        if (cards.isEmpty()) {
            target = new HealthCard();
            target.setPatientId(patientId);
            target.setCardId(card.getCardId());
            target.setCardNum(generateCardNum());
            target.setExpiryDate(LocalDate.now().plusYears(3));
            target.setCvv(String.format("%03d", new Random().nextInt(1000)));
            target.setHtBalance(BigDecimal.ZERO);
        } else {
            target = cards.get(0);
        }

        target.setHtBalance(nz(target.getHtBalance()).add(htCredit));
        healthCardRepository.save(target);
    }

    private String generateCardNum() {
        Random rng = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            if (i > 0 && i % 4 == 0) {
                sb.append('-');
            }
            sb.append(rng.nextInt(10));
        }
        String cardNum = sb.toString();
        return healthCardRepository.existsByCardNum(cardNum) ? generateCardNum() : cardNum;
    }

    private DescriptionParts parseDescription(String description) {
        if (description == null || description.isBlank()) {
            return new DescriptionParts("", "", "");
        }

        String investment = "";
        String location = "";
        String notes = "";

        String[] lines = description.split("\\n");
        for (String line : lines) {
            if (line.startsWith("INV=")) {
                investment = line.substring(4).trim();
            } else if (line.startsWith("LOC=")) {
                location = line.substring(4).trim();
            } else if (line.startsWith("NOTES=")) {
                notes = line.substring(6).trim();
            }
        }

        // Backward-compatible fallback for any pre-formatted row.
        if (investment.isEmpty() && location.isEmpty() && notes.isEmpty()) {
            investment = description;
        }

        return new DescriptionParts(investment, location, notes);
    }

    private static class DescriptionParts {
        private final String investment;
        private final String location;
        private final String notes;

        private DescriptionParts(String investment, String location, String notes) {
            this.investment = investment;
            this.location = location;
            this.notes = notes;
        }
    }

    private static class HospitalPoolSnapshot {
        private final int patientCount;
        private final int openTrades;
        private final BigDecimal totalAtPool;
        private final BigDecimal totalAtPoolPkr;
        private final BigDecimal allocatedPkr;
        private final BigDecimal availablePkr;

        private HospitalPoolSnapshot(
                int patientCount,
                int openTrades,
                BigDecimal totalAtPool,
                BigDecimal totalAtPoolPkr,
                BigDecimal allocatedPkr,
                BigDecimal availablePkr) {
            this.patientCount = patientCount;
            this.openTrades = openTrades;
            this.totalAtPool = totalAtPool;
            this.totalAtPoolPkr = totalAtPoolPkr;
            this.allocatedPkr = allocatedPkr;
            this.availablePkr = availablePkr;
        }
    }
}
