package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.marketplace.dto.CreateTradeRequest;
import com.SehatVault.SehatVaultBackend.marketplace.dto.HospitalAtPoolDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.OrderBookDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.OrderBookLevelDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.PatientTradeDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.TradeDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.TradeParticipantDetailDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.UpdateTradeRequest;
import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import com.SehatVault.SehatVaultBackend.marketplace.entity.TradeParticipation;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
import com.SehatVault.SehatVaultBackend.marketplace.repository.TradeParticipationRepository;
import com.SehatVault.SehatVaultBackend.wallet.service.TokenPriceService;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.blockchain.model.BlockchainTxRef;
import com.SehatVault.SehatVaultBackend.blockchain.service.TokenContractGateway;
import com.SehatVault.SehatVaultBackend.blockchain.util.TokenUnitConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceService {

    private final MarketplaceTradeRepository marketplaceTradeRepository;
    private final PatientRepository patientRepository;
    private final HospitalAtPoolService hospitalAtPoolService;
    private final TokenPriceService tokenPriceService;
    private final com.SehatVault.SehatVaultBackend.marketplace.repository.PatientAtAssignmentRepository patientAtAssignmentRepository;
    private final AtTradingService atTradingService;
    private final TradeParticipationRepository tradeParticipationRepository;
    private final UserRepository userRepository;
    private final AssetDepositRepository assetDepositRepository;
    private final TokenContractGateway tokenContractGateway;

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

    public List<TradeParticipantDetailDto> getTradeParticipants(UUID tradeId) {
        if (!marketplaceTradeRepository.existsById(tradeId)) {
            throw new IllegalArgumentException("Trade not found");
        }

        List<TradeParticipation> participations = tradeParticipationRepository.findByTradeId(tradeId);
        if (participations.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        Set<UUID> patientIds = participations.stream()
                .map(TradeParticipation::getPatientId)
                .collect(Collectors.toSet());
        Set<UUID> assetIds = participations.stream()
                .map(TradeParticipation::getAssetId)
                .collect(Collectors.toSet());

        Map<UUID, Patient> patientsById = patientRepository.findAllById(patientIds).stream()
                .collect(Collectors.toMap(Patient::getId, p -> p));
        Set<UUID> userIds = patientsById.values().stream()
                .map(Patient::getUserId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getUserId, u -> u));
        Map<UUID, AssetDeposit> assetsById = assetDepositRepository.findAllById(assetIds).stream()
                .collect(Collectors.toMap(AssetDeposit::getAssetId, a -> a));

        return participations.stream().map(p -> {
            Patient patient = patientsById.get(p.getPatientId());
            User user = patient != null && patient.getUserId() != null
                    ? usersById.get(patient.getUserId())
                    : null;
            AssetDeposit asset = assetsById.get(p.getAssetId());

            return TradeParticipantDetailDto.builder()
                    .participationId(p.getParticipationId())
                    .patientId(p.getPatientId())
                    .patientName(user != null ? user.getName() : null)
                    .patientRegistrationId(patient != null ? patient.getRegistrationId() : null)
                    .assetId(p.getAssetId())
                    .assetType(asset != null ? asset.getAssetType() : null)
                    .assetValue(asset != null ? asset.getAssetValue() : null)
                    .atAllocated(p.getAtAllocated())
                    .atMonetaryValuePkr(p.getAtMonetaryValuePkr())
                    .participationStatus(p.getParticipationStatus() == null
                            ? null
                            : p.getParticipationStatus().name())
                    .tradeStartTime(p.getTradeStartTime())
                    .tradeEndTime(p.getTradeEndTime())
                    .build();
        }).collect(Collectors.toList());
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

        // Per-patient selections — admin picks which Pool 2 assets fund this trade.
        java.util.List<CreateTradeRequest.ParticipantSelection> selections = request.getSelections() == null
                ? java.util.Collections.emptyList()
                : request.getSelections();

        BigDecimal atPrice = tokenPriceService.getAtPricePkr();
        BigDecimal totalSelectedAt = BigDecimal.ZERO;
        for (CreateTradeRequest.ParticipantSelection s : selections) {
            if (s.getPatientId() == null || s.getAssetId() == null) {
                throw new IllegalArgumentException("Each selection must include patientId and assetId");
            }
            BigDecimal at = nz(s.getAtAmount());
            if (at.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Each selection's AT amount must be greater than zero");
            }
            totalSelectedAt = totalSelectedAt.add(at);

            var assignment = patientAtAssignmentRepository
                    .findByPatientIdAndAssetId(s.getPatientId(), s.getAssetId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "AT assignment not found for patient " + s.getPatientId() + " asset " + s.getAssetId()));
            if (assignment.getAvailabilityStatus() != com.SehatVault.SehatVaultBackend.marketplace.entity.PatientAtAssignment.AvailabilityStatus.AVAILABLE) {
                throw new IllegalArgumentException(
                        "Selected asset " + s.getAssetId() + " is not in Pool 2 (Available); cannot include in trade");
            }
            if (Boolean.TRUE.equals(assignment.getTradingOptOut())) {
                throw new IllegalArgumentException(
                        "Patient has opted asset " + s.getAssetId() + " out of trading; cannot include");
            }
            if (nz(assignment.getAvailableAt()).compareTo(at) < 0) {
                throw new IllegalArgumentException(
                        "Asset " + s.getAssetId() + " has only " + assignment.getAvailableAt()
                                + " AT in Pool 2; requested " + at);
            }
        }

        // Selected total in PKR. The buy price (amountInvested) must be <= this total —
        // we may scale down each selection proportionally so they sum exactly to amountInvested.
        BigDecimal selectedPkr = totalSelectedAt.multiply(atPrice);
        if (!selections.isEmpty()) {
            if (selectedPkr.compareTo(amountInvested) < 0) {
                throw new IllegalArgumentException(
                        "Sum of selected AT (PKR " + selectedPkr.toPlainString()
                                + ") is less than the trade's investment amount (PKR "
                                + amountInvested.toPlainString() + "). Allocate more AT or lower the buy price.");
            }
        } else {
            // Backward-compat fallback when no selections are sent.
            HospitalPoolSnapshot poolSnapshot = buildHospitalPoolSnapshot(request.getHospitalId());
            if (amountInvested.compareTo(poolSnapshot.availablePkr) > 0) {
                throw new IllegalArgumentException("Insufficient hospital AT pool. Available: "
                        + toAt(poolSnapshot.availablePkr).toPlainString()
                        + " AT, required: "
                        + toAt(amountInvested).toPlainString()
                        + " AT");
            }
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

        trade.setTradeTitle(assetName);
        trade.setTradeDescription(sanitize(request.getDescription()));
        trade.setInvestmentDescription(buildDescription(
                sanitize(request.getAssetType()).isEmpty() ? request.getInvestment() : request.getAssetType(),
                request.getLocation(),
                request.getNotes()));

        MarketplaceTrade saved = marketplaceTradeRepository.save(trade);

        // Lock each participant's AT — creates TradeParticipation rows + flips assignment to UNAVAILABLE.
        // If admins over-allocated (selectedPkr > amountInvested), scale each selection
        // proportionally so the total locked equals amountInvested exactly.
        BigDecimal scale = BigDecimal.ONE;
        if (!selections.isEmpty() && selectedPkr.compareTo(amountInvested) > 0) {
            scale = amountInvested.divide(selectedPkr, 12, RoundingMode.HALF_UP);
        }
        BigDecimal targetTotalAt = amountInvested.divide(atPrice, 8, RoundingMode.HALF_UP);
        BigDecimal cumulativeLocked = BigDecimal.ZERO;
        for (int i = 0; i < selections.size(); i++) {
            CreateTradeRequest.ParticipantSelection s = selections.get(i);
            var assignment = patientAtAssignmentRepository
                    .findByPatientIdAndAssetId(s.getPatientId(), s.getAssetId())
                    .orElseThrow();

            BigDecimal lockAt;
            boolean isLast = i == selections.size() - 1;
            if (isLast) {
                // Force exact total — assign whatever's left rounded up to the target.
                lockAt = targetTotalAt.subtract(cumulativeLocked).max(BigDecimal.ZERO)
                        .setScale(2, RoundingMode.HALF_UP);
            } else {
                lockAt = nz(s.getAtAmount()).multiply(scale).setScale(2, RoundingMode.HALF_UP);
            }
            // Don't lock more than what's actually available on the assignment.
            BigDecimal cap = nz(assignment.getAvailableAt());
            if (lockAt.compareTo(cap) > 0) {
                lockAt = cap;
            }
            if (lockAt.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            cumulativeLocked = cumulativeLocked.add(lockAt);
            atTradingService.startTradeWithPatientAt(
                    saved.getTradeId(),
                    s.getPatientId(),
                    s.getAssetId(),
                    assignment.getAssignmentId(),
                    lockAt);
        }

        return toDto(saved);
    }

    @Transactional
    public TradeDto updateTrade(UUID tradeId, UpdateTradeRequest request) {
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
        if (request.getQuantity() != null) {
            trade.setVolume(request.getQuantity());
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

        trade.setAmountInvested(amountInvested);
        trade.setAmountAfterTrade(amountAfterTrade);
        BigDecimal updatedProfitLoss = amountAfterTrade.subtract(amountInvested);
        trade.setProfitLoss(updatedProfitLoss);

        boolean justClosed = trade.getStatus() == MarketplaceTrade.TradeStatus.CLOSED
                && previousStatus != MarketplaceTrade.TradeStatus.CLOSED;

        MarketplaceTrade saved = marketplaceTradeRepository.save(trade);

        // If this update flipped the trade from active → closed, settle participations
        // so AT goes back to Pool 1 with profit/loss applied.
        if (justClosed) {
            try {
                atTradingService.settleTrade(saved.getTradeId(), updatedProfitLoss);
            } catch (Exception ex) {
                log.error("Trade {} marked CLOSED via update but settlement failed: {}",
                        saved.getTradeId(), ex.getMessage(), ex);
            }
            anchorTradeOnChain(saved.getTradeId(), updatedProfitLoss);
        }

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

        // If the trade is already CLOSED but has un-settled participations (e.g. closed
        // under older code that didn't run settlement), retroactively settle them so AT
        // returns to Pool 1. Then return.
        if (trade.getStatus() == MarketplaceTrade.TradeStatus.CLOSED) {
            try {
                atTradingService.settleTrade(trade.getTradeId(), nz(trade.getProfitLoss()));
            } catch (Exception ex) {
                log.error("Retroactive settle failed for already-closed trade {}: {}",
                        trade.getTradeId(), ex.getMessage(), ex);
            }
            return toDto(trade);
        }

        BigDecimal quantity = nz(trade.getVolume());
        BigDecimal amountInvested = nz(trade.getOpeningPrice()).multiply(quantity);

        // exitValue / currentValue on close are the TOTAL PKR the trade closed at
        // (not per-unit). Falls back to the stored closingPrice × quantity when
        // neither is provided.
        BigDecimal amountAfterTrade = request != null && request.getExitValue() != null
                ? request.getExitValue()
                : request != null && request.getCurrentValue() != null
                        ? request.getCurrentValue()
                        : nz(trade.getClosingPrice()).multiply(quantity);
        if (amountAfterTrade.compareTo(BigDecimal.ZERO) <= 0) {
            amountAfterTrade = amountInvested;
        }
        BigDecimal exitPerUnit = quantity.compareTo(BigDecimal.ZERO) > 0
                ? amountAfterTrade.divide(quantity, 8, RoundingMode.HALF_UP)
                : nz(trade.getClosingPrice());

        BigDecimal profitLoss = amountAfterTrade.subtract(amountInvested);

        trade.setStatus(MarketplaceTrade.TradeStatus.CLOSED);
        trade.setEndTime(LocalDateTime.now());
        trade.setClosingPrice(exitPerUnit);
        trade.setAmountInvested(amountInvested);
        trade.setAmountBeforeTrade(amountInvested);
        trade.setAmountAfterTrade(amountAfterTrade);
        trade.setProfitLoss(profitLoss);

        MarketplaceTrade saved = marketplaceTradeRepository.save(trade);

        // Settle each participation: returns AT to Pool 1 (WITH_PATIENT) with P/L applied,
        // burns the AT from hospital_at_pool_entries, and updates patient wallet totals.
        try {
            atTradingService.settleTrade(saved.getTradeId(), profitLoss);
        } catch (Exception ex) {
            log.error("Trade {} closed but settlement failed: {}", saved.getTradeId(), ex.getMessage(), ex);
        }

        anchorTradeOnChain(saved.getTradeId(), profitLoss);

        return toDto(saved);
    }

    /**
     * Persist the closed trade as a HospitalFinancials.recordTrade(...) on-chain audit anchor.
     * Sums AT allocated across all participations (the AT actually invested in the trade) and
     * records the absolute profit (the contract treats profit as uint256, so losses anchor as
     * profit=0 — the off-chain row keeps the signed P/L).
     */
    private void anchorTradeOnChain(UUID tradeId, BigDecimal profitLoss) {
        try {
            BigDecimal totalInvestedAt = tradeParticipationRepository.findByTradeId(tradeId).stream()
                    .map(TradeParticipation::getAtAllocated)
                    .map(v -> v == null ? BigDecimal.ZERO : v)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (totalInvestedAt.compareTo(BigDecimal.ZERO) <= 0) {
                return;
            }

            BigDecimal positiveProfit = profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) > 0
                    ? profitLoss
                    : BigDecimal.ZERO;

            BlockchainTxRef ref = tokenContractGateway.recordTradeOnChain(
                    TokenUnitConverter.toBaseUnits(totalInvestedAt, 18),
                    TokenUnitConverter.toBaseUnits(positiveProfit, 18)
            );
            log.info("Anchored trade {} on-chain (tx={}, block={})", tradeId,
                    ref.getTransactionHash(), ref.getBlockNumber());
        } catch (Exception ex) {
            // Audit anchor is best-effort: a chain failure must not break the off-chain close path.
            log.warn("Failed to anchor trade {} on-chain: {}", tradeId, ex.getMessage());
        }
    }

    // =================== PRIVATE HELPERS ===================

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
        return nz(pkr).divide(tokenPriceService.getAtPricePkr(), 2, RoundingMode.HALF_UP);
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

        BigDecimal totalAtPoolPkr = totalAtPool.multiply(tokenPriceService.getAtPricePkr());
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
        return "INV=" + sanitize(investment) + "\nLOC=" + sanitize(location) + "\nNOTES=" + sanitize(notes);
    }

    private String sanitize(String value) {
        return value == null ? "" : value.replace("\n", " ").trim();
    }

    private DescriptionParts parseDescription(String description) {
        if (description == null || description.isBlank()) {
            return new DescriptionParts("", "", "");
        }

        String investment = "";
        String location = "";
        String notes = "";

        for (String line : description.split("\\n")) {
            if (line.startsWith("INV=")) {
                investment = line.substring(4).trim();
            } else if (line.startsWith("LOC=")) {
                location = line.substring(4).trim();
            } else if (line.startsWith("NOTES=")) {
                notes = line.substring(6).trim();
            }
        }

        if (investment.isEmpty() && location.isEmpty() && notes.isEmpty()) {
            investment = description;
        }

        return new DescriptionParts(investment, location, notes);
    }

    private record DescriptionParts(String investment, String location, String notes) {}

    private record HospitalPoolSnapshot(
            int patientCount,
            int openTrades,
            BigDecimal totalAtPool,
            BigDecimal totalAtPoolPkr,
            BigDecimal allocatedPkr,
            BigDecimal availablePkr) {}
}
