package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.marketplace.dto.CreateTradeRequest;
import com.SehatVault.SehatVaultBackend.marketplace.dto.OrderBookDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.OrderBookLevelDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.PatientTradeDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.TradeDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.UpdateTradeRequest;
import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceService {

    private final MarketplaceTradeRepository marketplaceTradeRepository;

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
            request.getNotes()
        ));

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
        String description = request.getDescription() != null ? sanitize(request.getDescription()) : sanitize(trade.getTradeDescription());
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

        MarketplaceTrade saved = marketplaceTradeRepository.save(trade);
        log.info("[Marketplace] updateTrade saved tradeId={} tradeTitle='{}' tradeDescription='{}'",
            saved.getTradeId(), saved.getTradeTitle(), saved.getTradeDescription());
        return toDto(saved);
    }

    @Transactional
    public TradeDto closeTrade(UUID tradeId) {
        MarketplaceTrade trade = marketplaceTradeRepository.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("Trade not found"));

        trade.setStatus(MarketplaceTrade.TradeStatus.CLOSED);
        trade.setEndTime(LocalDateTime.now());

        BigDecimal amountInvested = nz(trade.getOpeningPrice()).multiply(nz(trade.getVolume()));
        BigDecimal amountAfterTrade = nz(trade.getAmountAfterTrade());
        if (amountAfterTrade.compareTo(BigDecimal.ZERO) <= 0) {
            amountAfterTrade = amountInvested;
        }
        trade.setAmountInvested(amountInvested);
        trade.setAmountAfterTrade(amountAfterTrade);
        trade.setProfitLoss(amountAfterTrade.subtract(amountInvested));

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
        String assetName = sanitize(request.getAssetName()).isEmpty() ? sanitize(request.getTitle()) : sanitize(request.getAssetName());
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
        String resolvedTitle = sanitize(trade.getTradeTitle()).isEmpty() ? parts.investment : sanitize(trade.getTradeTitle());
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
}
