package com.SehatVault.SehatVaultBackend.marketplace.controller;

import com.SehatVault.SehatVaultBackend.marketplace.dto.ApiResponse;
import com.SehatVault.SehatVaultBackend.marketplace.dto.CreateTradeRequest;
import com.SehatVault.SehatVaultBackend.marketplace.dto.OrderBookDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.PatientTradeDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.TradeDto;
import com.SehatVault.SehatVaultBackend.marketplace.dto.UpdateTradeRequest;
import com.SehatVault.SehatVaultBackend.marketplace.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping("/trades/hospital/{hospitalId}")
    public ResponseEntity<ApiResponse<List<TradeDto>>> getHospitalTrades(@PathVariable UUID hospitalId) {
        List<TradeDto> trades = marketplaceService.getTradesByHospital(hospitalId);
        return ResponseEntity.ok(ApiResponse.success(trades));
    }

    @GetMapping("/trades/hospital/{hospitalId}/patient-view")
    public ResponseEntity<ApiResponse<List<PatientTradeDto>>> getPatientViewTrades(@PathVariable UUID hospitalId) {
        List<PatientTradeDto> trades = marketplaceService.getPatientViewTrades(hospitalId);
        return ResponseEntity.ok(ApiResponse.success(trades));
    }

    @GetMapping("/order-book")
    public ResponseEntity<ApiResponse<OrderBookDto>> getOrderBook(
            @RequestParam UUID hospitalId,
            @RequestParam(required = false) String investment) {
        OrderBookDto orderBook = marketplaceService.getOrderBook(hospitalId, investment);
        return ResponseEntity.ok(ApiResponse.success(orderBook));
    }

    @PostMapping("/trades")
    public ResponseEntity<ApiResponse<TradeDto>> createTrade(@RequestBody CreateTradeRequest request) {
        try {
            TradeDto created = marketplaceService.createTrade(request);
            return ResponseEntity.ok(ApiResponse.success("Trade created", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/trades/{tradeId}")
    public ResponseEntity<ApiResponse<TradeDto>> updateTrade(
            @PathVariable UUID tradeId,
            @RequestBody UpdateTradeRequest request) {
        try {
            TradeDto updated = marketplaceService.updateTrade(tradeId, request);
            return ResponseEntity.ok(ApiResponse.success("Trade updated", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/trades/{tradeId}/close")
    public ResponseEntity<ApiResponse<TradeDto>> closeTrade(@PathVariable UUID tradeId) {
        try {
            TradeDto closed = marketplaceService.closeTrade(tradeId);
            return ResponseEntity.ok(ApiResponse.success("Trade closed", closed));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
